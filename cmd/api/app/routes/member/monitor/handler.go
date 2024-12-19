package monitor

import (
	"github.com/gin-gonic/gin"
	"github.com/karmada-io/dashboard/cmd/api/app/router"
	"github.com/karmada-io/dashboard/cmd/api/app/types/common"
	"github.com/karmada-io/dashboard/pkg/monitor"
)

func GetProjectList(c *gin.Context) {
	dataSelect := common.ParseDataSelectPathParameter(c)
	monitorConfig, err := monitor.GetProjectList(dataSelect)
	if err != nil {
		common.Fail(c, err)
		return
	}
	common.Success(c, monitorConfig)
}

func init() {
	r := router.MemberV1()
	r.GET("/monitor", GetProjectList)
}
