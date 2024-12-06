import i18nInstance from '@/utils/i18n';
import Panel from '@/components/panel';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Input,
  message,
  Space,
  Table,
  TableColumnProps,
  Badge,
} from 'antd';
import { GetNamespaces } from '@/services/namespace.ts';
import type { Namespace } from '@/services/namespace.ts';
import type { Node } from '@/services/node.ts'
import { Icons } from '@/components/icons';
import dayjs from 'dayjs';
import { useWindowSize } from '@uidotdev/usehooks';
import { DeleteResource } from '@/services/unstructured';
import { useState } from 'react';
import { DataSelectQuery } from '@/services/base.ts';
import TagList from '@/components/tag-list';
import { GetNodes } from '@/services/node.ts'

const MemberNodePage = () => {
  const [searchFilter, setSearchFilter] = useState('');
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['GetNodes', searchFilter],
    queryFn: async () => {
      const query: DataSelectQuery = {};
      if (searchFilter) {
        query.filterBy = ['name', searchFilter];
      }
      const clusters = await GetNodes('member1');
      return clusters.data || {};
    },
  });
  const size = useWindowSize();
  console.log('size.width', size?.width);
  const columns: TableColumnProps<Node>[] = [
    {
      title: '节点名称',
      key: 'namespaceName',
      width: 200,
      render: (_, r) => {
        return r.objectMeta.name;
      },
    },
    {
      title: i18nInstance.t('14d342362f66aa86e2aa1c1e11aa1204'),
      key: 'label',
      align: 'left',
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
        return (
          <TagList
            tags={params}
            maxLen={size && size.width! > 1800 ? undefined : 1}
          />
        );
      },
    },
    {
      title: i18nInstance.t('e4b51d5cd0e4f199e41c25be1c7591d3'),
      dataIndex: 'ready',
      key: 'ready',
      render: (_, r) => (
          <Badge status={r.status.conditions[4].status === 'True' ? 'success' : 'error'}/>
      ),
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

  const [messageApi, messageContextHolder] = message.useMessage();

  return (
    <Panel>
      <div className={'flex flex-row justify-between mb-4'}>
        <Input.Search
          placeholder={i18nInstance.t('cfaff3e369b9bd51504feb59bf0972a0')}
          className={'w-[400px]'}
          onPressEnter={(e) => {
            const input = e.currentTarget.value;
            setSearchFilter(input);
          }}
        />
      </div>
      <Table
        rowKey={(r: Node) => r.objectMeta.name || ''}
        columns={columns}
        loading={isLoading}
        dataSource={data?.items || []}
      />

      {messageContextHolder}
    </Panel>
  );
};

export default MemberNodePage;
