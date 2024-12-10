import i18nInstance from '@/utils/i18n';
import { FC, useMemo } from 'react';
import {
  Drawer,
  Card,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import { GetMemberPodDetail } from '@/services/member/pod';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import styles from './index.module.less';
import { useCluster } from '@/hooks/cluster-context';

export interface PodDetailDrawerProps {
  open: boolean;
  namespace: string;
  name: string;
  onClose: () => void;
}

const PodDetailDrawer: FC<PodDetailDrawerProps> = (props) => {
  const { open, namespace, name, onClose } = props;
  const { cluster } = useCluster();
  const enableFetch = useMemo(() => {
    return !!( name && namespace);
  }, [name, namespace]);
  const { data: detailData, isLoading: isDetailDataLoading } = useQuery({
    queryKey: ['GetMemberPodDetail', cluster, name, namespace],
    queryFn: async () => {
      const podDetailRet = await GetMemberPodDetail({
        clustername: cluster,
        namespace,
        name,
      });
      return podDetailRet.data || {};
    },
    enabled: enableFetch,
  });

  return (
    <Drawer
      title={i18nInstance.t('0af9d9af618327e912ac9f91bbe6a30f')}
      placement="right"
      open={open}
      width={1000}
      loading={isDetailDataLoading}
      onClose={onClose}
    >
      <Card title={i18nInstance.t('9e5ffa068ed435ced73dc9bf5dd8e09c')} bordered>
        <div className="flex flex-row space-x-4 mb-4">
          <Statistic
            title={i18nInstance.t('d7ec2d3fea4756bc1642e0f10c180cf5')}
            value={detailData?.metadata?.name || '-'}
          />

          <Statistic
            title={i18nInstance.t('a4b28a416f0b6f3c215c51e79e517298')}
            value={detailData?.metadata?.namespace || '-'}
          />

          <Statistic
            title={i18nInstance.t('eca37cb0726c51702f70c486c1c38cf3')}
            value={
              detailData?.metadata?.creationTimestamp
                ? dayjs(detailData?.metadata?.creationTimestamp).format(
                  'YYYY-MM-DD',
                )
                : '-'
            }
          />

          <Statistic
            title={i18nInstance.t('4a6341a8bcc68e0b7120dbc89014b6a2')}
            value="2h"
          />
        </div>

        <div className="mb-4">
          <div className="text-base text-gray-500 mb-2">
            镜像
          </div>
          <div>
            {detailData?.spec.containers[0].image}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-base text-gray-500 mb-2">
            {i18nInstance.t('14d342362f66aa86e2aa1c1e11aa1204')}
          </div>
          <div>
            {detailData?.metadata?.labels && Object.entries(detailData.metadata.labels).map(([key, value]) => (
              <Tag key={key}>
              {key}: {value}
              </Tag>
            ))}
          </div>
        </div>

        <div>
          <div className="text-base text-gray-500 mb-2">
            {i18nInstance.t('c11db1c192a765494c8859d854199085')}
          </div>
          <div>
            <Tag>deployment.kubernetes.io/revision:2</Tag>
            <Tag>kubectl.kubernetes.io/last-applied-configuration</Tag>
            {detailData?.metadata?.annotations && Object.entries(detailData.metadata.annotations).map(([key, value]) => (
              <Tag key={key}>
              {key}: {value}
              </Tag>
            ))}
          </div>
        </div>

      </Card>
      <Card
        title={i18nInstance.t('be41a5333fef1e665214254aaf11f4fd')}
        bordered
        className={styles['schedule-container']}
      >
      </Card>
    </Drawer>
  );
};

export default PodDetailDrawer;
