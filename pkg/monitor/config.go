package monitor

import (
	"fmt"
	"github.com/karmada-io/karmada/pkg/util/fedinformer"
	"gopkg.in/yaml.v3"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"
	"os"
)

var monitorConfig MonitorConfig

const (
	configName         = "karmada-dashboard-configmap"
	monitorConfigName  = "karmada-dashboard-monitor-configmap"
	configNamespace    = "karmada-system"
	defaultEnvName     = "prod"
	defaultMonitorName = "monitor"
)

var (
	configmapGVR = schema.GroupVersionResource{
		Group:    "",
		Version:  "v1",
		Resource: "configmaps",
	}
)

func GetMonitorCmName() string {
	envName := os.Getenv("MonitorFileName")
	if envName == "" {
		envName = defaultMonitorName
	}
	return fmt.Sprintf("%s.yaml", envName)
}

func InitMonitorConfig(k8sClient kubernetes.Interface, stopper <-chan struct{}) {
	factory := informers.NewSharedInformerFactory(k8sClient, 0)
	resource, err := factory.ForResource(configmapGVR)
	if err != nil {
		klog.Fatalf("Failed to create resource: %v", err)
		panic(err)
	}
	filterFunc := func(obj interface{}) bool {
		configMap, ok := obj.(*v1.ConfigMap)
		return ok && configMap.Namespace == configNamespace && configMap.Name == monitorConfigName
	}
	onAdd := func(obj interface{}) {
		configMap := obj.(*v1.ConfigMap)
		klog.Infof("ConfigMap %s Added", configMap.Name)
		klog.Infof("ConfigMap Data is \n%+v", configMap.Data[GetMonitorCmName()])
		var tmpConfig MonitorConfig
		if err := yaml.Unmarshal([]byte(configMap.Data[GetMonitorCmName()]), &tmpConfig); err != nil {
			klog.Errorf("Failed to unmarshal ConfigMap %s: %v", configMap.Name, err)
		} else {
			monitorConfig = tmpConfig
		}
	}
	onUpdate := func(oldObj, newObj interface{}) {
		newConfigMap := newObj.(*v1.ConfigMap)
		klog.V(2).Infof("ConfigMap %s Updated\n", newConfigMap.Name)
		var tmpConfig MonitorConfig
		if err := yaml.Unmarshal([]byte(newConfigMap.Data[GetMonitorCmName()]), &tmpConfig); err != nil {
			klog.Errorf("Failed to unmarshal ConfigMap %s: %v", newConfigMap.Name, err)
		} else {
			monitorConfig = tmpConfig
		}
	}
	evtHandler := fedinformer.NewFilteringHandlerOnAllEvents(filterFunc, onAdd, onUpdate, nil)
	_, err = resource.Informer().AddEventHandler(evtHandler)
	if err != nil {
		klog.Errorf("Failed to add handler for resource(%s): %v", configmapGVR.String(), err)
		return
	}
	factory.Start(stopper)
	klog.Infof("MonitorConfigMap informer started, waiting for MonitorConfigMap events...")
}

func GetMonitorConfig() MonitorConfig {
	return MonitorConfig{
		Project: monitorConfig.Project,
	}
}
