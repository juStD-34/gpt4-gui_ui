import { Button, Input, message, Space } from "antd";
import { useContext, useState } from "react";
import { ModalContext } from "..";
import { API_ENDPOINTS } from "../../../const";

type Props = {};

const NewEnv = ({}: Props) => {
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const modalContext = useContext(ModalContext);

  const { onCancel } = modalContext;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const file = files[0];
      setFile(file);
    }
  };

  const onCreateEnv = async () => {
    if (!file || !fileName) {
      message.error("Please provide a file and environment name.");
      return;
    }
  
    const formData = new FormData();
    formData.append("envSpecFile", file); // Match API parameter
    formData.append("envName", fileName); // Match API parameter
  
    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.CREATE_ENV, {
        method: "POST",
        body: formData,
      });
  
      if (res.ok) {
        const result = await res.json();
        if (result.error) {
          message.error(result.message);
        } else {
          message.success(result.message);
          onCancel(true); // Close modal or reset form
        }
      } else {
        message.error("Failed to create environment.");
      }
    } catch (error) {
      console.log(error)
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div>
      <div className="grid">
        <p>Name</p>
        <Input
          placeholder="Input file name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
      </div>
      <div className="mt-4 flex flex-row w-full gap-8">
        <div className="flex flex-col">
          <p>Specification</p>
          <p>{`(.xlsx)`}</p>
        </div>
        <div className="mt-2">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            style={{ marginBottom: 20 }}
          />
          <div style={{ marginTop: 20 }}>
            {file && (
              <Space direction="vertical">
                <p>
                  <strong>Uploaded File: </strong>
                  {file.name}
                </p>
              </Space>
            )}
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center">
        <Button type="primary" onClick={onCreateEnv} loading={loading}>
          Create
        </Button>
        <Button style={{ marginLeft: 20 }} onClick={() => onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default NewEnv;
