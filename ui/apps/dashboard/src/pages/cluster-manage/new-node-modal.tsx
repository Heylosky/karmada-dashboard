import { Modal, Badge, Table } from 'antd';
import { FC } from 'react';
import { NodeDetail } from '@/services/node';

interface NodeDetailModalProps {
    open: boolean;
    onClose: () => void;
    nodeDetail: NodeDetail;
}

const NodeDetailModal: FC<NodeDetailModalProps> = ({ open, onClose, nodeDetail }) => {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: 'Label',
            dataIndex: 'label',
            key: 'label',
        },
        {
            title: 'CPU',
            dataIndex: 'cpu',
            key: 'cpu',
        },
        {
            title: 'Memory',
            dataIndex: 'memory',
            key: 'memory',
        },
        {
            title: 'Ready',
            dataIndex: 'ready',
            key: 'ready',
            render: (text: string) => (
                <Badge status={text === 'True' ? 'success' : 'error'}/>
            ),
        },
    ];

    const dataSource = nodeDetail.items.map(item => {
        // 将 labels 对象转换为字符串
        const labels = item.objectMeta.labels;
        const labelString = labels ? Object.entries(labels).map(([key, value]) => `${key}: ${value}`).join(', ') : 'N/A';

        // 提取 InternalIP 地址
        const internalIP = item.status.addresses?.find(addr => addr.type === 'InternalIP')?.address || 'N/A';

        // 提取 Ready 状态
        const readyCondition = item.status.conditions?.find(cond => cond.type === 'Ready');
        const readyStatus = readyCondition ? readyCondition.status : 'Unknown';

        return {
            key: item.objectMeta.uid, // 使用 uid 作为唯一键
            name: item.objectMeta.name,
            uid: item.objectMeta.uid,
            label: labelString, // 将 labels 转换后的字符串作为 label
            cpu: item.status.capacity.cpu || 'N/A', // 提取 cpu
            memory: item.status.capacity.memory || 'N/A', // 提取 memory
            pods: item.status.capacity.pods || 'N/A', // 提取 pods
            ip: internalIP, // 将 InternalIP 地址作为 ip
            ready: readyStatus, // 将 Ready 状态作为 ready
        };
    });

    return (
        <Modal
            title="Node Details"
            open={open}
            onCancel={onClose}
            footer={null}
            width={1600}
        >
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false} // 如果不需要分页，可以设置为 false
            />
        </Modal>
    );
};

export default NodeDetailModal;