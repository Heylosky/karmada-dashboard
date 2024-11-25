import { useState, useEffect } from 'react';
import { useCluster } from '@/hooks/cluster-context';
import { PodList, PodDetail, GetPodDetail } from '@/services/pod';
import { Table } from 'antd';

const MemberPodView = () => {
    const { cluster } = useCluster();
    const [dataSource, setDataSource] = useState<any[]>([]); // 使用 any[] 或者更具体的类型
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchNodeDetails = async () => {
            try {
                const response = await GetPodDetail(cluster);
                const podList: { data: PodList } = response; // 访问 data 属性
                
                if (podList && podList.data && podList.data.items) {
                    const data = podList.data.items.map((item: PodDetail) => { // 显式指定 item 的类型
                        // 将 labels 对象转换为字符串
                        const labels = item.objectMeta.labels;
                        const labelString = labels ? Object.entries(labels).map(([key, value]) => `${key}: ${value}`).join(', ') : 'N/A';

                        // 提取 podIP
                        const podIP = item.objectMeta.annotations?.['cni.projectcalico.org/podIP'] || 'N/A';

                        // 提取 Ready 状态
                        const readyCondition = item.status.conditions?.find(cond => cond.type === 'Ready');
                        const readyStatus = readyCondition ? readyCondition.status : 'Unknown';

                        return {
                            key: item.objectMeta.uid,
                            name: item.objectMeta.name,
                            namespace: item.objectMeta.namespace,
                            uid: item.objectMeta.uid,
                            label: labelString,
                            ip: podIP,
                            ready: readyStatus,
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
            title: 'Namespeace',
            dataIndex: 'namespace',
            key: 'namespace',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Labels',
            dataIndex: 'label',
            key: 'label',
        },
        {
            title: 'IP',
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

export default MemberPodView;