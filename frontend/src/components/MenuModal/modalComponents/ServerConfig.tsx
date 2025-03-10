import { Input, Button, InputNumber, Form, message } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { ModalContext } from "..";
import { API_ENDPOINTS } from "../../../const";

type Props = {};

const ServerConfig = (props: Props) => {
  const modalContext = useContext(ModalContext);
  const { onCancel, configData, selectedMenuItem } = modalContext;
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // Initialize form with values from context when component mounts or configData changes
  useEffect(() => {
    if (configData && configData.properties) {
      form.setFieldsValue(configData.properties);
    } else {
      form.resetFields();
    }
  }, [configData, form]);

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // If we have a configData with an id, update it
      if (configData && configData.id) {
        const updatedConfig = {
          ...configData,
          properties: {
            ...configData.properties,
            ...values,
          },
        };

        const response = await fetch(`${API_ENDPOINTS.CONFIG}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedConfig),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        message.success("Configuration saved successfully");
        onCancel(true); // Close modal and reload
      } else {
        // Handle the case for creating a new configuration
        const newConfig = {
          configName: selectedMenuItem || "New Config",
          envId: 1, // Default environment ID
          properties: values,
        };

        const response = await fetch(`${API_ENDPOINTS.CONFIG}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newConfig),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        message.success("Configuration created successfully");
        onCancel(true); // Close modal and reload
      }
    } catch (error) {
      console.error("Error saving config:", error);
      message.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  // Determine which form fields to render based on the selected menu item
  const renderFormFields = () => {
    // Check if we're editing an existing config or creating a new one
    const isEditMode = configData && configData.id;
    
    // For Colab configurations
    if (selectedMenuItem === "COLAB") {
      return (
        <>
          <Form.Item
            name="colabUrl"
            label="Ngrok Public URL"
            rules={[{ required: true, message: "Please enter the Colab public URL" }]}
          >
            <Input placeholder="https://xxxx-xx-xx-xxx-xxx.ngrok.io" />
          </Form.Item>
          <Form.Item
            name="logcolabUrl"
            label="Ngrok Log URL"
            rules={[{ required: true, message: "Please enter the Colab log URL" }]}
          >
            <Input placeholder="https://xxxx-xx-xx-xxx-xxx.ngrok.io" />
          </Form.Item>
        </>
      );
    }
    
    // For Local server configurations
    if (selectedMenuItem === "LOCAL") {
      return (
        <>
          <Form.Item
            name="url"
            label="Server URL"
            rules={[{ required: true, message: "Please enter the server URL" }]}
          >
            <Input placeholder="http://localhost:5000" />
          </Form.Item>
          <Form.Item
            name="model_path"
            label="Model Path"
            rules={[{ required: true, message: "Please enter the model path" }]}
          >
            <Input placeholder="/path/to/model" />
          </Form.Item>
          <Form.Item
            name="redis_host"
            label="Redis Host"
            rules={[{ required: true, message: "Please enter the Redis host" }]}
          >
            <Input placeholder="localhost" />
          </Form.Item>
          <Form.Item
            name="redis_port"
            label="Redis Port"
            rules={[{ required: true, message: "Please enter the Redis port" }]}
          >
            <InputNumber min={1} max={65535} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="sub_channel"
            label="Subscription Channel"
          >
            <Input placeholder="sub" />
          </Form.Item>
        </>
      );
    }
    
    // For Sagemaker configurations
    if (selectedMenuItem === "SAGEMAKER") {
      return (
        <>
          <Form.Item
            name="endpointUrl"
            label="Endpoint URL"
            rules={[{ required: true, message: "Please enter the Sagemaker endpoint URL" }]}
          >
            <Input placeholder="https://runtime.sagemaker.amazonaws.com/..." />
          </Form.Item>
          <Form.Item
            name="region"
            label="AWS Region"
            rules={[{ required: true, message: "Please enter the AWS region" }]}
          >
            <Input placeholder="us-east-1" />
          </Form.Item>
          <Form.Item
            name="accessKeyId"
            label="AWS Access Key ID"
            rules={[{ required: true, message: "Please enter your AWS Access Key ID" }]}
          >
            <Input placeholder="AKIAXXXXXXXXXXXXXXXX" />
          </Form.Item>
          <Form.Item
            name="secretAccessKey"
            label="AWS Secret Access Key"
            rules={[{ required: true, message: "Please enter your AWS Secret Access Key" }]}
          >
            <Input.Password placeholder="Your AWS secret access key" />
          </Form.Item>
        </>
      );
    }
    
    // Default case - show form fields based on existing properties
    if (isEditMode && configData.properties) {
      return Object.entries(configData.properties).map(([key, value]) => {
        // Skip internal fields
        if (key === 'id' || key === 'envId' || key === 'configName') {
          return null;
        }
        
        // Render number inputs for number values
        if (typeof value === 'number') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          );
        }
        
        // Default to text input
        return (
          <Form.Item
            key={key}
            name={key}
            label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
          >
            <Input />
          </Form.Item>
        );
      });
    }
    
    // Fallback - empty form with message
    return (
      <div className="text-center text-gray-500 my-4">
        <p>No configuration options available for this server type.</p>
      </div>
    );
  };

  return (
    <div className="space-y-4 py-4">
      <Form
        form={form}
        layout="vertical"
        initialValues={configData?.properties || {}}
      >
        {renderFormFields()}
      </Form>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="primary"
          className="bg-blue-600"
          onClick={onSave}
          loading={saving}
        >
          Save
        </Button>
        <Button onClick={() => onCancel()}>Cancel</Button>
      </div>
    </div>
  );
};

export default ServerConfig;