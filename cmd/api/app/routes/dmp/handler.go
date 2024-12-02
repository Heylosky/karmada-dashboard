package dmp

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
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

func handleDmpRequest(c *gin.Context) {
	// 获取DMP请求路径
	fullPath := "/apis" + c.Param("path")
	url := "https://12.0.216.149:32443" + fullPath

	// 获取查询参数并构建完整的 URL
	queryParams := c.Request.URL.Query()
	if len(queryParams) > 0 {
		url += "?" + queryParams.Encode()
	}
	klog.Infof("构建DMP请求URL: %s", url)

	// // 加载客户端证书和私钥
	// cert, err := tls.LoadX509KeyPair("/etc/cert/client.crt", "/etc/cert/client.key")
	// if err != nil {
	// 	klog.ErrorS(err, "Error loading client certificate")
	// 	return
	// }

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

func init() {
	r := router.ApisV1()
	r.Any("/*path", handleDmpRequest)
}
