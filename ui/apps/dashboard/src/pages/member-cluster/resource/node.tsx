import { Table } from 'antd';
import { useEffect } from 'react';
import { GetNodeDetail } from '@/services/node';
import { useState } from 'react';
import { useCluster } from '@/hooks/cluster-context';
import { useQuery } from '@tanstack/react-query';
import { GetClusterDetail } from '@/services/cluster';

// 定义 NodeItem 接口，表示 items 中每个节点的结构
interface NodeItem {
    objectMeta: {
        name: string;
        uid: string;
        labels?: { [key: string]: string }; // 可选的 labels 属性
    };
    status: {
        capacity: {
            cpu: string;
            memory: string;
            pods: string;
        };
        addresses?: Array<{
            type: string;
            address: string;
        }>; // 可选的 addresses 属性
        conditions?: Array<{
            type: string;
            status: string;
            lastHeartbeatTime: string;
            lastTransitionTime: string;
            reason: string;
            message: string;
        }>; // 可选的 conditions 属性
    };
}

// 定义 NodeDetail 接口，表示整个节点详情的结构
interface NodeDetail {
    items: NodeItem[];
}

const MemberNodeView = () => {
    const { cluster } = useCluster();
    const [dataSource, setDataSource] = useState<any[]>([]); // 使用 any[] 或者更具体的类型
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchNodeDetails = async () => {
            try {
                const response = await GetNodeDetail(cluster);
                const nodeDetail: { data: NodeDetail } = response; // 访问 data 属性
                
                if (nodeDetail && nodeDetail.data && nodeDetail.data.items) {
                    const data = nodeDetail.data.items.map((item: NodeItem) => { // 显式指定 item 的类型
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

                    setDataSource(data);
                } else {
                    setDataSource([]); // 如果没有 items，设置为空数组
                }
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchNodeDetails();
    }, [cluster]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'UID',
            dataIndex: 'uid',
            key: 'uid',
        },
        {
            title: 'Labels',
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
            title: 'Pods',
            dataIndex: 'pods',
            key: 'pods',
        },
        {
            title: 'Internal IP',
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: 'Ready',
            dataIndex: 'ready',
            key: 'ready',
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false} // 如果不需要分页，可以设置为 false
        />
    );
};

export default MemberNodeView;