import { Modal, List } from 'antd';
import { FC } from 'react';

interface NodeDetail {
    items: Array<{
        objectMeta: {
            name: string;
        };
    }>;
}

interface NodeDetailModalProps {
    open: boolean;
    onClose: () => void;
    nodeDetail: NodeDetail;
}

const NodeDetailModal: FC<NodeDetailModalProps> = ({ open, onClose, nodeDetail }) => {
    return (
        <Modal
            title="Node Details"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <List
                header={<div>Node Names</div>}
                bordered
                dataSource={nodeDetail.items.map(item => item.objectMeta.name)}
                renderItem={item => (
                    <List.Item>
                        {item}
                    </List.Item>
                )}
            />
        </Modal>
    );
};

export default NodeDetailModal;