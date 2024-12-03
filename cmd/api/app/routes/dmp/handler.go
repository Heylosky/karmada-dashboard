package dmp

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/karmada-io/dashboard/cmd/api/app/router"
	"gopkg.in/yaml.v2"
	"k8s.io/klog/v2"
)

// KubeConfig 结构体用于解析 kubeconfig 文件
type KubeConfig struct {
	Users []User `yaml:"users"`
}

// User 结构体用于存储用户信息
type User struct {
	Name string   `yaml:"name"`
	User UserInfo `yaml:"user"`
}

// UserInfo 结构体用于存储用户的证书和密钥
type UserInfo struct {
	ClientCertificateData string `yaml:"client-certificate-data"`
	ClientKeyData         string `yaml:"client-key-data"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // 允许所有来源
	},
}

func handleDmpRequest(c *gin.Context) {
	// 判断是否需要ws升级
	if c.Request.Header.Get("Upgrade") == "websocket" {
		wsHandler(c)
		klog.Info("使用websocket连接完毕")
		return
	}

	// 获取DMP请求路径
	fullPath := "/apis" + c.Param("path")
	url := "https://12.0.216.149:32443" + fullPath

	// 获取查询参数并构建完整的 URL
	queryParams := c.Request.URL.Query()
	if len(queryParams) > 0 {
		url += "?" + queryParams.Encode()
	}
	klog.Infof("构建DMP请求URL: %s", url)

	kubeconfigFile, err := os.Open("/etc/kubeconfig")
	if err != nil {
		klog.ErrorS(err, "Error opening kubeconfig file")
	}
	defer kubeconfigFile.Close()

	// 解析 kubeconfig 文件
	var kubeconfig KubeConfig
	decoder := yaml.NewDecoder(kubeconfigFile)
	if err := decoder.Decode(&kubeconfig); err != nil {
		klog.ErrorS(err, "Error decoding kubeconfig file")
	}

	// 查找 karmada-admin 用户
	var certData, keyData []byte
	for _, user := range kubeconfig.Users {
		if user.Name == "karmada-admin" {
			certData, err = base64.StdEncoding.DecodeString(user.User.ClientCertificateData)
			if err != nil {
				klog.ErrorS(err, "Error decoding client certificate data")
			}
			keyData, err = base64.StdEncoding.DecodeString(user.User.ClientKeyData)
			if err != nil {
				klog.ErrorS(err, "Error decoding client key data")
			}
			break
		}
	}

	// 创建 TLS 证书
	cert, err := tls.X509KeyPair(certData, keyData)
	if err != nil {
		klog.ErrorS(err, "Error creating X509 key pair")
	}

	// 创建一个 HTTPS 客户端
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				Certificates:       []tls.Certificate{cert},
				InsecureSkipVerify: true,
			},
		},
	}

	// 定义请求处理函数
	requestHandlers := map[string]func() (*http.Response, error){
		http.MethodGet: func() (*http.Response, error) {
			// 创建 GET 请求
			req, err := http.NewRequest(http.MethodGet, url, nil)
			if err != nil {
				return nil, err
			}
			// 复制请求头
			for key, value := range c.Request.Header {
				for _, v := range value {
					req.Header.Add(key, v)
				}
			}
			return client.Do(req)
		},
		http.MethodPost: func() (*http.Response, error) {
			body, err := io.ReadAll(c.Request.Body)
			if err != nil {
				return nil, err
			}
			defer c.Request.Body.Close()

			// 创建新的 POST 请求
			req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(body))
			if err != nil {
				return nil, err
			}
			req.Header.Set("Content-Type", c.ContentType())
			// 复制请求头
			for key, value := range c.Request.Header {
				for _, v := range value {
					req.Header.Add(key, v)
				}
			}

			return client.Do(req)
		},
		http.MethodPut: func() (*http.Response, error) {
			body, err := io.ReadAll(c.Request.Body)
			if err != nil {
				return nil, err
			}
			defer c.Request.Body.Close()
			req, err := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(body))
			if err != nil {
				return nil, err
			}
			req.Header.Set("Content-Type", c.ContentType())
			for key, value := range c.Request.Header {
				for _, v := range value {
					req.Header.Add(key, v)
				}
			}
			return client.Do(req)
		},
		http.MethodDelete: func() (*http.Response, error) {
			req, err := http.NewRequest(http.MethodDelete, url, nil)
			if err != nil {
				return nil, err
			}
			req.Header.Set("Content-Type", c.ContentType())
			for key, value := range c.Request.Header {
				for _, v := range value {
					req.Header.Add(key, v)
				}
			}
			return client.Do(req)
		},
	}

	// 获取请求处理函数
	handler, exists := requestHandlers[c.Request.Method]
	if !exists {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Method not configured for DMP in karmada-dashboard-api"})
		return
	}

	// 调用请求处理函数
	resp, err := handler()
	if err != nil {
		klog.ErrorS(err, "Error sending request")
		return
	}
	defer resp.Body.Close()

	klog.Infof("DMP Response Status: %s\n", resp.Status)

	// 设置返回 Content-Type
	contentType := resp.Header.Get("Content-Type")
	if contentType != "" {
		c.Header("Content-Type", contentType)
	}
	// 设置返回所有 headers
	for key, values := range resp.Header {
		for _, value := range values {
			c.Header(key, value)
		}
	}
	// 设置返回体
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		klog.ErrorS(err, "Error reading response body")
		return
	}

	c.Data(http.StatusOK, contentType, body)
}

func wsHandler(c *gin.Context) {
	// 升级ws连接
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.String(http.StatusInternalServerError, "Failed to upgrade connection: %v", err)
		return
	}
	defer conn.Close()

	// 获取请求头
	headers := http.Header{}
	// 从请求中提取指定的头部
	// headers.Set("Sec-Websocket-Extensions", c.Request.Header.Get("Sec-Websocket-Extensions"))
	// headers.Set("Sec-Websocket-Key", c.Request.Header.Get("Sec-Websocket-Key"))
	headers.Set("Sec-Websocket-Protocol", c.Request.Header.Get("Sec-Websocket-Protocol"))
	// headers.Set("Sec-Websocket-Version", c.Request.Header.Get("Sec-Websocket-Version"))

	// 获取DMP WS请求路径
	fullPath := "/apis" + c.Param("path")
	targetURL := "wss://12.0.216.149:32443" + fullPath
	// 获取查询参数并构建完整的 URL
	queryParams := c.Request.URL.Query()
	if len(queryParams) > 0 {
		targetURL += "?" + queryParams.Encode()
	}
	klog.Infof("准备ws连接地址: %s", targetURL)

	// 创建一个 TLS 配置
	kubeconfigFile, err := os.Open("/etc/kubeconfig")
	if err != nil {
		klog.ErrorS(err, "Error opening kubeconfig file")
	}
	defer kubeconfigFile.Close()
	var kubeconfig KubeConfig
	decoder := yaml.NewDecoder(kubeconfigFile)
	if err := decoder.Decode(&kubeconfig); err != nil {
		klog.ErrorS(err, "Error decoding kubeconfig file")
	}
	var certData, keyData []byte
	for _, user := range kubeconfig.Users {
		if user.Name == "karmada-admin" {
			certData, err = base64.StdEncoding.DecodeString(user.User.ClientCertificateData)
			if err != nil {
				klog.ErrorS(err, "Error decoding client certificate data")
			}
			keyData, err = base64.StdEncoding.DecodeString(user.User.ClientKeyData)
			if err != nil {
				klog.ErrorS(err, "Error decoding client key data")
			}
			break
		}
	}
	cert, err := tls.X509KeyPair(certData, keyData)
	if err != nil {
		klog.ErrorS(err, "Error creating X509 key pair")
	}
	tlsConfig := &tls.Config{
		Certificates:       []tls.Certificate{cert},
		InsecureSkipVerify: true,
	}

	// 创建一个新的和后端的 WebSocket 连接
	klog.Info("准备开始建立和后端的连接")
	dialer := websocket.Dialer{
		TLSClientConfig: tlsConfig,
	}
	backendConn, _, err := dialer.Dial(targetURL, headers)
	if err != nil {
		klog.ErrorS(err, "Failed to connect to backend WebSocket")
		// 发送错误消息给客户端
		conn.WriteMessage(websocket.TextMessage, []byte("Failed to connect to backend WebSocket"))
		return
	}
	defer backendConn.Close()

	klog.Info("开始ws消息处理")
	// // 处理消息转发
	// go func() {
	// 	for {
	// 		// 从客户端读取消息
	// 		_, msg, err := conn.ReadMessage()
	// 		if err != nil {
	// 			klog.ErrorS(err, "读取ws信息失败")
	// 			break
	// 		}
	// 		// 转发消息到后端
	// 		if err := backendConn.WriteMessage(websocket.TextMessage, msg); err != nil {
	// 			klog.ErrorS(err, "写DMP ws失败")
	// 			break
	// 		}
	// 	}
	// }()

	for {
		// 从后端读取消息
		_, msg, err := backendConn.ReadMessage()
		if err != nil {
			klog.ErrorS(err, "读取DMP ws信息失败")
			break
		}
		// 转发消息到客户端
		if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			klog.ErrorS(err, "写ws失败")
			break
		}
	}
	klog.Info("ws连接退出")
}

func init() {
	r := router.ApisV1()
	r.Any("/*path", handleDmpRequest)
}
