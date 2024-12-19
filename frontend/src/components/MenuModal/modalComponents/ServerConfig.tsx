import { Input, Button } from "antd";
import React, { useContext, useState } from "react";
import { ModalContext } from "..";

type Props = {};

const initialConfig = {
  ngrokPublicUrl: "",
  ngrokLogUrl: "",
};

const ServerConfig = (props: Props) => {
  const modalContext = useContext(ModalContext);
  const { onCancel } = modalContext;

  const [config, setConfig] = useState(
    initialConfig || {
      ngrokPublicUrl: "",
      ngrokLogUrl: "",
    }
  );

  const onSave = (config: typeof initialConfig) => {
    console.log("Save config", config);
    //TODO: call API to save config
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <p>Ngrok Public URL</p>
        <Input
          placeholder="Ngrok Public URL"
          value={config.ngrokPublicUrl}
          onChange={(e) =>
            setConfig((prev) => ({
              ...prev,
              ngrokPublicUrl: e.target.value,
            }))
          }
        />
        <p>Ngrok Log URL</p>
        <Input
          placeholder="Ngrok Log URL"
          value={config.ngrokLogUrl}
          onChange={(e) =>
            setConfig((prev) => ({
              ...prev,
              ngrokLogUrl: e.target.value,
            }))
          }
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="primary"
          className="bg-blue-600"
          onClick={() => {
            onSave(config);
            onCancel();
          }}
        >
          Save
        </Button>
        <Button onClick={() =>onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

export default ServerConfig;
