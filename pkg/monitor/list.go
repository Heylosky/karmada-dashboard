package monitor

import (
	"github.com/karmada-io/dashboard/pkg/common/errors"
	"github.com/karmada-io/dashboard/pkg/common/types"
	"github.com/karmada-io/dashboard/pkg/dataselect"
)

type ProjectList struct {
	ListMeta types.ListMeta  `json:"listMeta"`
	Project  []ProjectConfig `json:"project"`
	Errors   []error         `json:"errors"`
}

func GetProjectList(dsQuery *dataselect.DataSelectQuery) (*ProjectList, error) {
	a := GetMonitorConfig()
	nonCriticalErrors, criticalError := errors.ExtractErrors(nil)
	if criticalError != nil {
		return nil, criticalError
	}

	return toProjectList(a.Project, nonCriticalErrors, dsQuery), nil
}

func toProjectList(projects []ProjectConfig, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery) *ProjectList {
	projectList := &ProjectList{
		ListMeta: types.ListMeta{TotalItems: len(projects)},
	}

	projectCells, _ := dataselect.GenericDataSelectWithFilter(toCells(projects), dsQuery)
	projects = fromCells(projectCells)
	projectList.Errors = nonCriticalErrors

	for _, project := range projects {
		projectList.Project = append(projectList.Project, toProject(project))
	}

	return projectList
}

func toProject(project ProjectConfig) ProjectConfig {
	return ProjectConfig{
		Name:      project.Name,
		Cluster:   project.Cluster,
		Namespace: project.Namespace,
		Apps:      project.Apps,
	}
}
