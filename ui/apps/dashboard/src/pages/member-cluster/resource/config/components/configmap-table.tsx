import i18nInstance from '@/utils/i18n';
import { Button, Space, Table, TableColumnProps } from 'antd';
import TagList from '@/components/tag-list';
import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Config } from '@/services/config.ts';
import {
  GetMemberConfigMaps,
  GetMemberConfigMapDetail,
} from '@/services/member/config';
import { useCluster } from '@/hooks/cluster-context';

interface ConfigMapTableProps {
  labelTagNum?: number;
  selectedWorkSpace: string;
  searchText: string;
  onViewConfigMapContent: (r: any) => void;
  onEditConfigMapContent: (r: any) => void;
  onDeleteConfigMapContent: (r: Config) => void;
}

const ConfigMapTable: FC<ConfigMapTableProps> = (props) => {
  const {
    labelTagNum,
    selectedWorkSpace,
    searchText,
    onViewConfigMapContent,
    onEditConfigMapContent,
  } = props;
  const { cluster } = useCluster();
  const columns: TableColumnProps<Config>[] = [
    {
      title: i18nInstance.t('a4b28a416f0b6f3c215c51e79e517298', '命名空间'),
      key: 'namespaceName',
      width: 200,
      render: (_, r) => {
        return r.objectMeta.namespace;
      },
    },
    {
      title: i18nInstance.t('4fcad1c9ba0732214679e13bd69d998b', '配置名称'),
      key: 'configmapName',
      width: 300,
      render: (_, r) => {
        return r.objectMeta.name;
      },
    },
    {
      title: i18nInstance.t('1f7be0a924280cd098db93c9d81ecccd', '标签信息'),
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
      title: i18nInstance.t('2b6bc0f293f5ca01b006206c2535ccbc', '操作'),
      key: 'op',
      width: 200,
      render: (_, r) => {
        return (
          <Space.Compact>
            <Button
              size={'small'}
              type="link"
              onClick={async () => {
                const ret = await GetMemberConfigMapDetail({
                  clustername: cluster,
                  namespace: r.objectMeta.namespace,
                  name: r.objectMeta.name,
                });
                onViewConfigMapContent(ret?.data);
              }}
            >
              {i18nInstance.t('607e7a4f377fa66b0b28ce318aab841f', '查看')}
            </Button>
            <Button
              size={'small'}
              type="link"
              onClick={async () => {
                const ret = await GetMemberConfigMapDetail({
                  clustername: cluster,
                  namespace: r.objectMeta.namespace,
                  name: r.objectMeta.name,
                });
                onEditConfigMapContent(ret?.data);
              }}
            >
              YAML
            </Button>
          </Space.Compact>
        );
      },
    },
  ];
  const { data, isLoading } = useQuery({
    queryKey: ['GetMemberConfigMaps', selectedWorkSpace, searchText],
    queryFn: async () => {
      const services = await GetMemberConfigMaps({
        clustername: cluster,
        namespace: selectedWorkSpace,
        keyword: searchText,
      });
      return services.data || {};
    },
  });
  return (
    <Table
      rowKey={(r: Config) =>
        `${r.objectMeta.namespace}-${r.objectMeta.name}` || ''
      }
      columns={columns}
      loading={isLoading}
      dataSource={data?.items || []}
    />
  );
};

export default ConfigMapTable;
