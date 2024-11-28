package dmp

import (
	"bytes"
	"fmt"
	"io"
	"net/http"

	"crypto/tls"

	"github.com/gin-gonic/gin"
	"github.com/karmada-io/dashboard/cmd/api/app/router"
	"k8s.io/klog/v2"
)

func handleDmpRequest(c *gin.Context) {
	// 获取DMP请求路径
	fullPath := "/apis" + c.Param("path")
	url := "https://12.0.216.149:32443" + fullPath // 替换为你的 API 服务器 URL
	fmt.Println(url)

	// 加载客户端证书和私钥
	cert, err := tls.LoadX509KeyPair("/etc/cert/client.crt", "/etc/cert/client.key")
	if err != nil {
		fmt.Println("Error loading client certificate:", err)
		return
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
			return client.Get(url)
		},
		http.MethodPost: func() (*http.Response, error) {
			body, err := io.ReadAll(c.Request.Body)
			if err != nil {
				return nil, err
			}
			defer c.Request.Body.Close()
			return client.Post(url, c.ContentType(), bytes.NewBuffer(body))
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
			return client.Do(req)
		},
		http.MethodDelete: func() (*http.Response, error) {
			req, err := http.NewRequest(http.MethodDelete, url, nil)
			if err != nil {
				return nil, err
			}
			return client.Do(req)
		},
	}

	// 获取请求处理函数
	handler, exists := requestHandlers[c.Request.Method]
	if !exists {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Method not configured in gin"})
		return
	}

	// 调用请求处理函数
	resp, err := handler()
	if err != nil {
		fmt.Println("Error sending request:", err)
		return
	}
	defer resp.Body.Close()

	klog.Infof("DMP Response Status: %s\n", resp.Status)

	// 获取DMP返回的 Content-Type
	contentType := resp.Header.Get("Content-Type")
	if contentType != "" {
		c.Header("Content-Type", contentType)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}

	c.Data(http.StatusOK, contentType, body)
}

func init() {
	r := router.ApisV1()
	r.Any("/*path", handleDmpRequest)
}
