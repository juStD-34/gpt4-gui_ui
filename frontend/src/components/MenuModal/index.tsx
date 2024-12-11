import React from "react";
import { Modal } from "antd";
import { MENU_ACTION } from "./modalComponents/modalComponents";

type MenuModalProps = {
  isShowModal: boolean;
  onCancel: () => void;
  selectedMenuItem: string | null;
};

export const ModalContext = React.createContext({
  isShowModal: false,
  onCancel: () => {},
  selectedMenuItem: null,
});

const MenuModal: React.FC<MenuModalProps> = ({
  isShowModal,
  onCancel,
  selectedMenuItem,
}) => {
  return (
    <ModalContext.Provider value={{ isShowModal, onCancel, selectedMenuItem }}>
      <Modal
        title={MENU_ACTION[selectedMenuItem || ""]?.title}
        open={isShowModal}
        onCancel={onCancel}
        footer={null}
        width={600}
      >
        {MENU_ACTION[selectedMenuItem || ""]?.component}
      </Modal>
    </ModalContext.Provider>
  );
};

export default MenuModal;
