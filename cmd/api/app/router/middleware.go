package router

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/karmada-io/dashboard/cmd/api/app/types/common"
	"github.com/karmada-io/dashboard/pkg/client"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func EnsureMemberClusterMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		karmadaClient := client.InClusterKarmadaClient()
		_, err := karmadaClient.ClusterV1alpha1().Clusters().Get(context.TODO(), c.Param("clustername"), metav1.GetOptions{})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusOK, common.BaseResponse{
				Code: 500,
				Msg:  err.Error(),
			})
			return
		}
		// Init client for member cluster
		memberClient := client.InClusterClientForMemberCluster(c.Param("clustername"))
		c.Set("client", memberClient)

		c.Next()
	}
}

func V1Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Init client for controller cluster
		k8sClient := client.InClusterClientForKarmadaApiServer()
		c.Set("client", k8sClient)

		c.Next()
	}
}
