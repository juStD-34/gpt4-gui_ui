import { Button, Dropdown, MenuProps, message, Space, Spin } from "antd";
import { DownOutlined, SettingOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import MenuModal from "../MenuModal";
import {
  FILES_MENU,
  SETTINGS_MENU,
  SETUP_SELENIUM,
  TRAIN_MODEL,
  COLAB,
  LOCAL,
  SAGEMAKER,
  CONFIGURE_TRAINING_SERVER,
} from "./const";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "../../const";
import { Config } from "../../types";
import { useConfig } from "../../context/ConfigContext";
type Props = {};

// interface Config {
//   id: number;
//   configName: string;
//   envId: number;
//   properties: Record<string, any>;
// }

const Menu = ({}: Props) => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); 

  const {setConfigId, setSelectedConfig} = useConfig();
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [serverConfigs, setServerConfigs] = useState<Config[]>([]);


  const navigate = useNavigate();

  // Fetch server configurations from API
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.CONFIG);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setServerConfigs(data);
        
        // If we have configs and none selected yet, select the first one
        if (data.length > 0 && !selectedServer) {
          setSelectedServer(data[0].configName);
          setConfigId(data[0].id)
          setSelectedConfig(data[0].id)
        }
      } catch (error) {
        console.error("Error fetching server configurations:", error);
        message.error("Failed to load server configurations");
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  // Map configurations to menu items
  // Group configurations by their type (COLAB, LOCAL, SAGEMAKER)
  const serverItems = serverConfigs.map((config) => {
    // Determine the key based on configName
    let menuKey = LOCAL; // default
    if (config.configName.toLowerCase().includes('colab')) {
      menuKey = COLAB;
    } else if (config.configName.toLowerCase().includes('sagemaker')) {
      menuKey = SAGEMAKER;
    }
    
    return {
      key: config.configName,
      label: (
        <div className="flex items-center justify-between w-full pr-2 gap-3">
          <span>{config.configName}</span>
          <Button
            size="small"
            icon={<SettingOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedServer(config.configName);
              // Use the appropriate menu key for the modal
              setSelectedMenuItem(menuKey);
              setIsShowModal(true);
            }}
          />
        </div>
      ),
    };
  });

  const handleServerSelect = ({ key }: { key: string }) => {
    setSelectedServer(key);
    
    const selected = serverConfigs.find(config => config.configName === key);
    
    if (selected) {
      setConfigId(selected.id);
      setSelectedConfig(selected);
    }
  };

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    setSelectedMenuItem(e.key);
    switch (e.key) {
      case SETUP_SELENIUM:
        navigate("/setup-selenium");
        break;
      case TRAIN_MODEL:
        navigate("/train-model");
        break;
      case CONFIGURE_TRAINING_SERVER:
        // Show dropdown for server configuration options
        break;
      default:
        setIsShowModal(true);
        break;
    }
  };

  const handleModalClose = (shouldReload = false) => {
    setIsShowModal(false);
    setSelectedMenuItem(null);
    
    if (shouldReload) {
      window.location.reload();
    }
  };

  // Get the selected config
  const selectedConfig = serverConfigs.find(
    (config) => config.configName === selectedServer
  );

  return (
    <>
      <div className="text-white flex gap-4">
        <p
          className="hover:text-blue-400 cursor-pointer font-pacifico pr-12"
          onClick={() => {
            navigate("/");
          }}
        >
          <FontAwesomeIcon icon={faCode} className="pr-2" />
          GPT4GUI
        </p>
        <Dropdown
          menu={{ items: FILES_MENU, onClick: handleMenuClick }}
          trigger={["click"]}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              File
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
        <Dropdown
          menu={{ items: SETTINGS_MENU, onClick: handleMenuClick }}
          trigger={["click"]}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              Setting
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
        <Dropdown
          menu={{
            items: serverItems,
            onClick: handleServerSelect,
            selectedKeys: selectedServer ? [selectedServer] : [],
          }}
          trigger={["click"]}
          disabled={loading}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              {loading ? (
                <Spin size="small" />
              ) : selectedConfig ? (
                `Training Server: ${selectedConfig.configName}`
              ) : (
                "Choose Training Server"
              )}
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      </div>
      <MenuModal
        isShowModal={isShowModal}
        onCancel={handleModalClose}
        selectedMenuItem={selectedMenuItem}
        configData={selectedConfig}
      />
    </>
  );
};

export default Menu;