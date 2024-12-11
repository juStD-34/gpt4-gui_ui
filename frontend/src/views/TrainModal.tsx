"use client";

import {
  Layout,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Tabs,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Sider, Content } = Layout;
const { TextArea } = Input;
const { TabPane } = Tabs;

export default function TrainingInterface() {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("jsonContent");

  const onFinish = (values: any) => {
    console.log("Form values:", values);
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        width={300}
        className="bg-white p-4 overflow-y-auto"
        style={{ borderRight: "1px solid #f0f0f0" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-4"
        >
          {/* Training Set Upload */}
          <Form.Item
            label="Training set (JSON Lines)"
            name="trainingSet"
            className="mb-6"
          >
            <Upload>
              <Button icon={<UploadOutlined />}>Choose File</Button>
            </Upload>
          </Form.Item>

          {/* Training Epochs */}
          <Form.Item label="#Training Epochs" name="epochs" className="mb-6">
            <InputNumber className="w-full" min={1} defaultValue={1} />
          </Form.Item>

          {/* Model Type */}
          <Form.Item label="Model Type" name="modelType" className="mb-6">
            <Select defaultValue="codeT5Small">
              <Select.Option value="codeT5Small">CodeT5 Small</Select.Option>
              <Select.Option value="codeT5Base">CodeT5 Base</Select.Option>
              <Select.Option value="codeT5Large">CodeT5 Large</Select.Option>
            </Select>
          </Form.Item>

          {/* Logging Directory */}
          <Form.Item
            label={
              <div>
                <div>Logging Directory</div>
                <div className="text-xs text-gray-500">
                  (start with /content/drive/MyDrive/) (Colab only)
                </div>
              </div>
            }
            name="loggingDirectory"
            className="mb-6"
          >
            <TextArea rows={4} />
          </Form.Item>

          {/* Output Directory */}
          <Form.Item
            label={
              <div>
                <div>Output Directory</div>
                <div className="text-xs text-gray-500">
                  (start with /content/drive/MyDrive/) (Colab only)
                </div>
              </div>
            }
            name="outputDirectory"
            className="mb-6"
          >
            <TextArea rows={4} />
          </Form.Item>

          {/* Upload Button */}
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Upload
            </Button>
          </Form.Item>
        </Form>
      </Sider>

      <Content className="bg-white p-6">
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-6">
          <TabPane tab="JSON Content" key="jsonContent" />
          <TabPane tab="JSON Analysis" key="jsonAnalysis" />
          <TabPane tab="Training Logs" key="trainingLogs" />
        </Tabs>

        {/* Content area for the selected tab */}
        <div className="min-h-[500px]">
          {activeTab === "jsonContent" && (
            <div className="text-gray-500">
              JSON content will be displayed here
            </div>
          )}
          {activeTab === "jsonAnalysis" && (
            <div className="text-gray-500">
              JSON analysis will be displayed here
            </div>
          )}
          {activeTab === "trainingLogs" && (
            <div className="text-gray-500">
              Training logs will be displayed here
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}
