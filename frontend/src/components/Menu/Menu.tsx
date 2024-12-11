import { Button, Dropdown, MenuProps, message, Space } from "antd";
import { DownOutlined, SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import MenuModal from "../MenuModal";
import {
  FILES_MENU,
  SERVERS_MENU,
  SETTINGS_MENU,
  SETUP_SELENIUM,
  TRAIN_MODEL,
} from "./const";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

type Props = {};

const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  message.info("Click on left button.");
};

const Menu = ({}: Props) => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);

  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [serverConfigs, setServerConfigs] = useState<Record<string, any>>({});

  const navigate = useNavigate();

  const serverItems = SERVERS_MENU.map((server) => ({
    key: server.key,
    label: (
      <div className="flex items-center justify-between w-full pr-2 gap-3">
        <span>{server.label}</span>
        <Button
          size="small"
          icon={<SettingOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedServer(server.key);
            setSelectedMenuItem(server.key);
            setIsShowModal(true);
          }}
        />
      </div>
    ),
  }));

  const handleServerSelect = ({ key }: { key: string }) => {
    setSelectedServer(key);
  };

  const handleSaveConfig = (config: any) => {
    if (selectedServer) {
      setServerConfigs((prev) => ({
        ...prev,
        [selectedServer]: config,
      }));
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
      default:
        setIsShowModal(true);
        break;
    }
  };

  const handleModalClose = () => {
    setIsShowModal(false);
    setSelectedMenuItem(null);
  };

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
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              {selectedServer
                ? `Training Server: ${
                    SERVERS_MENU.find((s) => s.key === selectedServer)?.label
                  }`
                : "Choose Training Server"}
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      </div>
      <MenuModal
        isShowModal={isShowModal}
        onCancel={handleModalClose}
        selectedMenuItem={selectedMenuItem}
      />
    </>
  );
};

export default Menu;
