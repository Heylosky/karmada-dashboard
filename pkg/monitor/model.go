package monitor

type MonitorConfig struct {
	Project []ProjectConfig `yaml:"project" json:"project"`
}

type ProjectConfig struct {
	Name      string `yaml:"name" json:"name"`
	Cluster   string `yaml:"cluster" json:"cluster"`
	Namespace string `yaml:"namespace" json:"namespace"`
	Apps      []App  `yaml:"apps" json:"apps"`
}

type App struct {
	Name   string `yaml:"name" json:"name"`
	Number int    `yaml:"number" json:"number"`
	Status int    `yaml:"status" json:"status"`
}
