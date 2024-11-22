import { FC, CSSProperties } from 'react';
import styles from './index.module.less';
import karmadaLogo from '@/assets/karmada-logo.svg';
import {
  setLang,
  getLangIcon,
  getLang,
  supportedLangConfig,
  getLangTitle,
} from '@/utils/i18n';
import { clusterConfig, getClusterTitle } from '@/utils/cluster';
import { Dropdown, Select } from 'antd';
import { fetchAndUpdateClusterConfig } from '@/utils/cluster';
import { useCluster } from '@/hooks/cluster-context';
import { useNavigate } from 'react-router-dom';

export interface IUserInfo {
  id: number;
  username: string;
  avatar: string;
}

interface INavigationProps {
  headerStyle?: CSSProperties;
  usePlaceholder?: boolean;
  brandText?: string;
  userInfo?: IUserInfo;
}

fetchAndUpdateClusterConfig()

const { Option } = Select;

const Navigation: FC<INavigationProps> = (props) => {
  const {
    headerStyle = {},
    usePlaceholder = true,
    brandText = 'Karmada Dashboard',
    userInfo,
  } = props;
  const { setCluster } = useCluster(); // 获取 setCluster 函数
  const navigate = useNavigate();
  const handleClusterChange = (value: string) => {
    setCluster(value); // 更新上下文中的 cluster 值
    navigate('/overview'); // 导航到目标页面
  };
  return (
    <>
      <div className={styles.navbar}>
        <div className={styles.header} style={headerStyle}>
          <div className={styles.left}>
            <div className={styles.brand}>
              <div className={styles.logoWrap}>
                <img className={styles.logo} src={karmadaLogo} />
              </div>
              <div className={styles.text}>{brandText}</div>
            </div>
          </div>
          <div className={styles.center}>
            {/* placeholder for center element */}
          </div>
          <div className={styles.right}>
            {/* cluster select components */}
            <div className={styles.extra}>
              {/* <Dropdown
                menu={{
                  items: Object.keys(clusterConfig).map((lang) => {
                    return {
                      key: lang,
                      label: getClusterTitle(lang),
                    };
                  }),
                }}
                placement="bottomLeft"
                arrow
              >
                <button>成员集群选择</button>
              </Dropdown> */}
              <Select
                onChange={handleClusterChange}
                placeholder="成员集群选择"
              >
                {Object.keys(clusterConfig).map((lang) => (
                  <Option key={lang} value={lang}>
                    {getClusterTitle(lang)}
                  </Option>
                ))}
              </Select>
            </div>
            {/* extra components */}
            <div className={styles.extra}>
              <Dropdown
                menu={{
                  onClick: async (v) => {
                    await setLang(v.key);
                    window.location.reload();
                  },
                  selectedKeys: [getLang()],
                  items: Object.keys(supportedLangConfig).map((lang) => {
                    return {
                      key: lang,
                      label: getLangTitle(lang),
                    };
                  }),
                }}
                placement="bottomLeft"
                arrow
              >
                {getLangIcon(getLang())}
              </Dropdown>
            </div>
            {/* user info */}
            {userInfo && (
              <div className={styles.userWrap}>
                <div className={styles.user}>
                  <img src={userInfo?.avatar} className={styles.avatar} />
                </div>
              </div>
            )}
          </div>
        </div>
        {usePlaceholder && <div className={styles.placeholder} />}
      </div>
    </>
  );
};
export default Navigation;
