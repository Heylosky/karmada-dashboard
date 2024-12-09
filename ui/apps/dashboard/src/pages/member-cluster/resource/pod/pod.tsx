import i18nInstance from '@/utils/i18n';
import Panel from '@/components/panel';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Input,
  Space,
  Table,
  Select,
  TableColumnProps,
} from 'antd';
import { GetMemberPods } from '@/services/member/pod.ts';
import type { Pod } from '@/services/member/pod.ts';
import { useWindowSize } from '@uidotdev/usehooks';
import { useMemo, useState } from 'react';
import { DataSelectQuery } from '@/services/base.ts';
import { useCluster } from '@/hooks/cluster-context';
import { GetMemberNamespaces } from '@/services/member/namespace.ts';

const MemberPodPage = () => {
  const [searchFilter, setSearchFilter] = useState<{
    selectedNamespace: string;
  }>({
    selectedNamespace: '',
  });
  const { cluster } = useCluster();
  const { data: nsData, isLoading: isNsDataLoading } = useQuery({
    queryKey: ['GetMemberNamespaces'],
    queryFn: async () => {
      const clusters = await GetMemberNamespaces({clustername: cluster}, {});
      return clusters.data || {};
    },
  });
  const nsOptions = useMemo(() => {
    if (!nsData?.namespaces) return [];
    return nsData.namespaces.map((item) => {
      return {
        title: item.objectMeta.name,
        value: item.objectMeta.name,
      };
    });
  }, [nsData]);
  const { data, isLoading } = useQuery({
    queryKey: ['GetMemberPods', searchFilter],
    queryFn: async () => {
      const query: DataSelectQuery = {};
      if (searchFilter) {
        query.filterBy = ['namespace', searchFilter.selectedNamespace];
      }
      const clusters = await GetMemberPods({clustername: cluster}, query);
      return clusters.data || {};
    },
  });
  const size = useWindowSize();
  console.log('size.width', size?.width);
  const columns: TableColumnProps<Pod>[] = [
    {
      title: i18nInstance.t('06ff2e9eba7ae422587c6536e337395f'),
      key: 'namespaceName',
      width: 200,
      render: (_, r) => {
        return r.objectMeta.namespace;
      },
    },
    {
        title: 'Pod名称',
        key: 'PodName',
        width: 200,
        render: (_, r) => {
          return r.objectMeta.name;
        },
      },
    {
      title: i18nInstance.t('2b6bc0f293f5ca01b006206c2535ccbc'),
      key: 'op',
      width: 200,
      render: (_, r) => {
        return (
          <Space.Compact>
            <Button size={'small'} type="link">
              {i18nInstance.t('607e7a4f377fa66b0b28ce318aab841f')}
            </Button>
          </Space.Compact>
        );
      },
    },
  ];

  return (
    <Panel>
      <div className={'flex flex-row space-x-4 mb-4'}>
        <Select
          options={nsOptions}
          className={'min-w-[200px]'}
          value={searchFilter.selectedNamespace}
          loading={isNsDataLoading}
          showSearch
          allowClear
          onChange={(v) => {
            setSearchFilter({
              ...searchFilter,
              selectedNamespace: v,
            });
          }}
        />
        <Input.Search
          placeholder={i18nInstance.t('cfaff3e369b9bd51504feb59bf0972a0')}
          className={'w-[400px]'}
          onPressEnter={(e) => {
            const input = e.currentTarget.value;
            setSearchFilter({
                ...searchFilter,
                selectedNamespace: input,
              });
          }}
        />
      </div>
      <Table
        rowKey={(r: Pod) => r.objectMeta.name || ''}
        columns={columns}
        loading={isLoading}
        dataSource={data?.items || []}
      />
    </Panel>
  );
};

export default MemberPodPage;
