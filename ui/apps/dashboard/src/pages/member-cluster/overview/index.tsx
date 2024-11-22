import i18nInstance from '@/utils/i18n';
import Panel from '@/components/panel';
import { Badge, Descriptions, DescriptionsProps } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { GetClusterDetail } from '@/services/cluster';
import dayjs from 'dayjs';
import { useCluster } from '@/hooks/cluster-context';
import { useEffect } from 'react';

const MemberOverview = () => {
  const { cluster } = useCluster();
  const { data, refetch } = useQuery({
    queryKey: ['GetClusterDetail', cluster], // 将 cluster 作为 queryKey 的一部分
    queryFn: async () => {
      const ret = await GetClusterDetail(cluster);
      return ret.data;
    },
    enabled: !!cluster, // 只有在 cluster 存在时才启用查询
    refetchOnWindowFocus: true, // 窗口获得焦点时重新获取数据
    refetchOnMount: true, // 每次挂载时重新获取数据
  });
  // 使用 useEffect 监听 cluster 的变化
  useEffect(() => {
    if (cluster) {
      refetch(); // 当 cluster 变化时重新获取数据
    }
  }, [cluster, refetch]); // 依赖于 cluster 和 refetch
  const basicItems: DescriptionsProps['items'] = [
    {
      key: 'kubernetes-version',
      label: i18nInstance.t('bd17297989ec345cbc03ae0b8a13dc0a'),
      children: data?.kubernetesVersion || '-',
    },
    {
      key: 'karmada-status',
      label: i18nInstance.t('3fea7ca76cdece641436d7ab0d02ab1b'),
      children:
        typeof data?.ready === 'string' && data?.ready === 'True' ? (
          <Badge
            color={'green'}
            text={i18nInstance.t('d679aea3aae1201e38c4baaaeef86efe')}
          />
        ) : (
          <Badge
            color={'red'}
            text={i18nInstance.t('903b25f64e1c0d9b7f56ed80c256a2e7')}
          />
        ),
    },
    {
      key: 'karmada-createtime',
      label: i18nInstance.t('eca37cb0726c51702f70c486c1c38cf3'),
      children:
        (data?.objectMeta.creationTimestamp &&
          dayjs(data?.objectMeta.creationTimestamp).format('YYYY-MM-DD HH:mm:ss')) ||
        '-',
    },
    {
      key: 'cluster-info',
      label: i18nInstance.t('a0d6cb39b547d45a530a3308dce79c86'),
      children: (
        <>
          <div>
            <span>{i18nInstance.t('6860e13ac48e930f8076ebfe37176b78')}</span>
            <span>
              {data?.nodeSummary.totalNum}/
              {data?.nodeSummary.readyNum}
            </span>
          </div>
          {/* <div>
            <span>{i18nInstance.t('a1dacced95ddca3603110bdb1ae46af1')}</span>
            <span>
              {data?.memberClusterStatus.cpuSummary.allocatedCPU &&
                data?.memberClusterStatus.cpuSummary.allocatedCPU.toFixed(2)}
              /{data?.memberClusterStatus.cpuSummary.totalCPU}
            </span>
          </div>
          <div>
            <span>{i18nInstance.t('5eaa09de6e55b322fcc299f641d73ce7')}</span>
            <span>
              {data?.memberClusterStatus?.memorySummary?.allocatedMemory &&
                (
                  data.memberClusterStatus.memorySummary.allocatedMemory /
                  8 /
                  1024 /
                  1024
                ).toFixed(2)}
              GiB /
              {data?.memberClusterStatus?.memorySummary?.totalMemory &&
                data.memberClusterStatus.memorySummary.totalMemory /
                  8 /
                  1024 /
                  1024}
              GiB
            </span>
          </div>
          <div>
            <span>{i18nInstance.t('820c4003e23553b3124f1608916d5282')}</span>
            <span>
              {data?.memberClusterStatus?.podSummary?.allocatedPod}/
              {data?.memberClusterStatus?.podSummary?.totalPod}
            </span>
          </div> */}
        </>
      ),

      span: 3,
    },
  ];

  return (
    <Panel>
      <Descriptions
        className={'mt-8'}
        title={i18nInstance.t('9e5ffa068ed435ced73dc9bf5dd8e09c')}
        bordered
        items={basicItems}
      />
    </Panel>
  );
};

export default MemberOverview;
