import React from "react";
import { Modal } from "antd";
import { MENU_ACTION } from "./modalComponents/modalComponents";

type MenuModalProps = {
  isShowModal: boolean;
  onCancel: (shouldReload?: boolean) => void;
  selectedMenuItem: string | null;
  configData?: any;
};

export const ModalContext = React.createContext({
  isShowModal: false,
  onCancel: (shouldReload = false) => {
    console.log("Modal closed");
    if (shouldReload) {
      window.location.reload(); // Chỉ reload khi cần thiết
    }
  },
  selectedMenuItem: null,
  configData: null as any,
});

const MenuModal: React.FC<MenuModalProps> = ({
  isShowModal,
  onCancel,
  selectedMenuItem,
  configData,
}) => {
  return (
    <ModalContext.Provider value={{ isShowModal, onCancel, selectedMenuItem, configData }}>
      <Modal
        title={MENU_ACTION[selectedMenuItem || ""]?.title}
        open={isShowModal}
        onCancel={() => onCancel()}
        footer={null}
        width={600}
      >
        {MENU_ACTION[selectedMenuItem || ""]?.component}
      </Modal>
    </ModalContext.Provider>
  );
};

export default MenuModal;