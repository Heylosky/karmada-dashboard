import { FC, useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import Editor from '@monaco-editor/react';
import _ from 'lodash';

export interface NewWorkloadEditorModalProps {
  open: boolean;
  serviceContent?: string;
  onCancel: () => Promise<void> | void;
}
const ServiceEditorModal: FC<NewWorkloadEditorModalProps> = (props) => {
  const { open, serviceContent = '', onCancel } = props;
  const [content, setContent] = useState<string>(serviceContent);
  useEffect(() => {
    console.log('workloadContent', serviceContent);
    setContent(serviceContent);
  }, [serviceContent]);
  function handleEditorChange(value: string | undefined) {
    setContent(value || '');
  }
  return (
    <Modal
      title={'Service'}
      open={open}
      width={1000}
      destroyOnClose={true}
      onCancel={async () => {
        await onCancel();
        setContent('');
      }}
      footer={[
        <Button onClick={
          async () => {
            await onCancel();
            setContent('');
          }
        }>
          关闭
        </Button>,
      ]}
    >
      <Editor
        height="600px"
        defaultLanguage="yaml"
        value={content}
        theme="vs-dark"
        options={{
          theme: 'vs-dark',
          lineNumbers: 'on',
          minimap: {
            enabled: false,
          },
        }}
        onChange={handleEditorChange}
      />
    </Modal>
  );
};
export default ServiceEditorModal;
