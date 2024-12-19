package monitor

import (
	"github.com/karmada-io/dashboard/pkg/dataselect"
)

type MonitorCell ProjectConfig

func (mc MonitorCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(mc.Name)
	default:
		return nil
	}
}

func toCells(std []ProjectConfig) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = MonitorCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []ProjectConfig {
	std := make([]ProjectConfig, len(cells))
	for i := range std {
		std[i] = ProjectConfig(cells[i].(MonitorCell))
	}
	return std
}
