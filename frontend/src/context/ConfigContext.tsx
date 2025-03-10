import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface Config {
  id: number;
  configName: string;
  envId: number;
  properties: Record<string, any>;
}

interface ConfigContextType {
  configId: number | null;
  setConfigId: (id: number | null) => void;
  envId: number | null;
  setEnvId: (id: number | null) => void;
  selectedConfig: Config | null;
  setSelectedConfig: (config: Config | null) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const getStoredConfigId = () => {
    const stored = localStorage.getItem('configId');
    return stored ? parseInt(stored, 10) : null;
  };
  
  const getStoredEnvId = () => {
    const stored = localStorage.getItem('envId');
    return stored ? parseInt(stored, 10) : null;
  };
  
  export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [configId, setConfigId] = useState<number | null>(getStoredConfigId());
    const [envId, setEnvId] = useState<number | null>(getStoredEnvId());
    const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);
  
    // Persist changes to localStorage
    useEffect(() => {
      if (configId) {
        localStorage.setItem('configId', configId.toString());
      } else {
        localStorage.removeItem('configId');
      }
    }, [configId]);
  
    useEffect(() => {
      if (envId) {
        localStorage.setItem('envId', envId.toString());
      } else {
        localStorage.removeItem('envId');
      }
    }, [envId]);
  
    const contextValue: ConfigContextType = {
      configId,
      setConfigId: (id: number | null) => {
        setConfigId(id);
      },
      envId,
      setEnvId: (id: number | null) => {
        setEnvId(id);
      },
      selectedConfig,
      setSelectedConfig,
    };
  
    return (
      <ConfigContext.Provider value={contextValue}>
        {children}
      </ConfigContext.Provider>
    );
  };
  
  export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
      throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
  };