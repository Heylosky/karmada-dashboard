import i18nInstance from '@/utils/i18n';
import { Button, Space, Table, TableColumnProps, Tag } from 'antd';
import {
  extractPropagationPolicy,
  Service,
} from '@/services/service.ts';
import { GetMemberServices } from '@/services/member/service.ts';
import TagList from '@/components/tag-list';
import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GetMemberServiceDetail } from '@/services/member/service.ts';
import { useCluster } from '@/hooks/cluster-context';

interface ServiceTableProps {
  labelTagNum?: number;
  selectedWorkSpace: string;
  searchText: string;
  onViewServiceContent: (r: any) => void;
  onDeleteServiceContent: (r: Service) => void;
}

const ServiceTable: FC<ServiceTableProps> = (props) => {
  const { cluster } = useCluster();
  const {
    labelTagNum,
    selectedWorkSpace,
    searchText,
    onViewServiceContent,
  } = props;
  const columns: TableColumnProps<Service>[] = [
    {
      title: i18nInstance.t('a4b28a416f0b6f3c215c51e79e517298'),
      key: 'namespaceName',
      width: 200,
      render: (_, r) => {
        return r.objectMeta.namespace;
      },
    },
    {
      title: i18nInstance.t('8f3747c057d893862fbe4b7980e9b451', '服务名称'),
      key: 'servicename',
      width: 300,
      render: (_, r) => {
        return r.objectMeta.name;
      },
    },
    {
      title: i18nInstance.t('1f7be0a924280cd098db93c9d81ecccd'),
      key: 'labelName',
      align: 'left',
      width: '30%',
      render: (_, r) => {
        if (!r?.objectMeta?.labels) {
          return '-';
        }
        const params = Object.keys(r.objectMeta.labels).map((key) => {
          return {
            key: `${r.objectMeta.name}-${key}`,
            value: `${key}:${r.objectMeta.labels[key]}`,
          };
        });
        return <TagList tags={params} maxLen={labelTagNum} />;
      },
    },
    {
      title: i18nInstance.t('8a99082b2c32c843d2241e0ba60a3619'),
      key: 'propagationPolicies',
      render: (_, r) => {
        const pp = extractPropagationPolicy(r);
        return pp ? <Tag>{pp}</Tag> : '-';
      },
    },
    {
      title: i18nInstance.t('eaf8a02d1b16fcf94302927094af921f'),
      key: 'overridePolicies',
      width: 150,
      render: () => {
        return '-';
      },
    },
    {
      title: i18nInstance.t('2b6bc0f293f5ca01b006206c2535ccbc'),
      key: 'op',
      width: 200,
      render: (_, r) => {
        return (
          <Space.Compact>
            <Button
              size={'small'}
              type="link"
              onClick={async () => {
                const ret = await GetMemberServiceDetail({
                  clustername: cluster,
                  namespace: r.objectMeta.namespace,
                  service: r.objectMeta.name
                });
                onViewServiceContent(ret?.data);
              }}
            >
              {i18nInstance.t('607e7a4f377fa66b0b28ce318aab841f')}
            </Button>
          </Space.Compact>
        );
      },
    },
  ];
  const { data, isLoading } = useQuery({
    queryKey: ['GetMemberServices', cluster, selectedWorkSpace, searchText],
    queryFn: async () => {
      const services = await GetMemberServices({
        clustername: cluster,
        namespace: selectedWorkSpace,
        keyword: searchText,
      });
      return services.data || {};
    },
  });
  return (
    <Table
      rowKey={(r: Service) =>
        `${r.objectMeta.namespace}-${r.objectMeta.name}` || ''
      }
      columns={columns}
      loading={isLoading}
      dataSource={data?.services || []}
    />
  );
};
export default ServiceTable;
