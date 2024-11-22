// src/ClusterContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 定义上下文的类型
interface ClusterContextType {
  cluster: string;
  setCluster: (cluster: string) => void;
}

// 创建上下文
const ClusterContext = createContext<ClusterContextType | undefined>(undefined);

// 创建上下文提供者
export const ClusterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // const [cluster, setCluster] = useState<string>('host'); // 默认值

  // 从 localStorage 中读取初始值，如果没有则使用 'host'
  const [cluster, setCluster] = useState<string>(() => {
    return localStorage.getItem('cluster') || 'host';
  });
  
  // 当 cluster 变化时，更新 localStorage
  useEffect(() => {
    localStorage.setItem('cluster', cluster);
  }, [cluster]);

  return (
    <ClusterContext.Provider value={{ cluster, setCluster }}>
      {children}
    </ClusterContext.Provider>
  );
};

// 自定义 Hook 用于使用上下文
export const useCluster = () => {
  const context = useContext(ClusterContext);
  if (!context) {
    throw new Error('useCluster must be used within a ClusterProvider');
  }
  return context;
};