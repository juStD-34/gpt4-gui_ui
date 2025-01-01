"use client";

import { useEffect, useState } from "react";
import {
  Layout,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Tabs,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "../const";

const { Sider, Content } = Layout;
const { TextArea } = Input;
const { TabPane } = Tabs;

export default function TrainingInterface() {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("jsonContent");
  const [jsonContent, setJsonContent] = useState("");
  const [options, setOptions] = useState([
    { value: "codeT5Small", label: "CodeT5 Small" },
    { value: "codeT5Base", label: "CodeT5 Base" },
    { value: "codeT5Large", label: "CodeT5 Large" },
  ]);
  // const [jsonAnalysis, setJsonAnalysis] = useState("");
  const [inputValue, setInputValue] = useState("");

  const onFinish = async (values: any) => {
    console.log("Form values:", values);

    // Tạo FormData để gửi file và các thông tin khác
    const formData = new FormData();

    // Kiểm tra và append file vào formData
    if (values.trainingSet && values.trainingSet.file) {
      console.log(values.trainingSet.file, "FILE")
      formData.append("file", values.trainingSet.file.originFileObj);
    }

    // Append các dữ liệu khác vào formData
    formData.append("epochs", values.epochs);
    formData.append("modelType", values.modelType);
    formData.append("loggingDir", values.loggingDirectory || "");
    formData.append("outputDir", values.outputDirectory || "");
    formData.append("configId", values.configId || 1)
    // formData.append("trainingRequest", JSON.stringify({
    //   epochs: values.epochs,
    //   modelType: values.modelType,
    //   loggingDirectory: values.loggingDirectory,
    //   outputDirectory: values.outputDirectory,
    //   configId: values.configId
    // }));
    
    console.log(formData)

    try {
      const response = await fetch(API_ENDPOINTS.TRAIN, {
        method: "POST",
        body: formData, // Gửi FormData thay vì JSON
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      message.success("Training started successfully!");
      console.log("API Response:", data);
    } catch (error) {
      console.error("API Error:", error);
      message.error("Failed to start training");
    }
  };


  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        console.log("File loaded successfully");
        resolve(event.target?.result as string);
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };

      reader.readAsText(file);
    });
  };

  const handleFileChange = async (info: any) => {
    // const file = event.target.files[0];
    const file = info.fileList[0];

    console.log("File change event:", file);
    if (file && file.originFileObj) {
      try {
        const content = await readFileContent(file.originFileObj);

        try {
          const jsonContent = JSON.parse(content);
          setJsonContent(JSON.stringify(jsonContent, null, 2)); // Pretty print JSON
          message.success(
            `${file.name} file uploaded and parsed successfully.`
          );
        } catch (error) {
          console.error("JSON parsing error:", error);
          message.error(`Failed to parse JSON: ${error.message}`);
        }
      } catch (error) {
        console.error("File reading error:", error);
        message.error(`Failed to read file: ${error}`);
      }
    } else {
      console.log("No file selected or file removed");
    }
  };

  const parseJsonAnalysis = (jsonContent: string) => {
    try {
      const jsonArray = JSON.parse(jsonContent);

      const aURLCounts: { [key: string]: { summaries: Set<string> } } = {};

      jsonArray.forEach((item: { aURL: string; bSummary: string }) => {
        const { aURL, bSummary } = item;
        if (aURL in aURLCounts) {
          aURLCounts[aURL].summaries.add(bSummary);
        } else {
          aURLCounts[aURL] = { summaries: new Set([bSummary]) };
        }
      });

      // Sort aURLs by the number of scenarios in descending order
      const sortedAURLCounts = Object.entries(aURLCounts).sort(
        (a, b) => b[1].summaries.size - a[1].summaries.size
      );

      const analysisResult = sortedAURLCounts
        .map(([aURL, data]) => {
          const summaryList = Array.from(data.summaries)
            .map((summary) => `- ${summary}`)
            .join("\n");
          return `${aURL} (${data.summaries.size} test scenarios)\n${summaryList}`;
        })
        .join("\n\n");

      return analysisResult;
      // setJsonAnalysis(analysisResult);
    } catch (error) {
      console.error("Error analyzing JSON:", error);
    }
  };

  const handleSearch = (value: string) => {
    setInputValue(value);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (
      event.key === "Enter" &&
      inputValue &&
      !options.some((option) => option.value === inputValue)
    ) {
      const newOption = { value: inputValue, label: inputValue };
      setOptions((prevOptions) => [...prevOptions, newOption]);
      form.setFieldsValue({ modelType: inputValue });
      setInputValue("");
    }
  };

  const handleChange = (value: string) => {
    console.log("Selected or input value:", value);
  };

  useEffect(() => {
    form.setFieldsValue({
      trainingSet: undefined,
      epochs: 1,
      modelType: undefined,
      loggingDirectory: undefined,
      outputDirectory: undefined,
    });
  }, []);

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
            <Upload
              accept=".json,.jsonl"
              beforeUpload={() => false}
              onChange={handleFileChange}
            >
              <Button icon={<UploadOutlined />}>Choose File</Button>
            </Upload>
            {/* <input
              type="file"
              accept=".json,.jsonl"
              onChange={handleFileChange}
            /> */}
          </Form.Item>

          {/* Training Epochs */}
          <Form.Item label="#Training Epochs" name="epochs" className="mb-6">
            <InputNumber className="w-full" min={1} defaultValue={1} />
          </Form.Item>

          <Input.Search placeholder="Search" enterButton />

          {/* Model Type */}
          <Form.Item label="Model Type" name="modelType" className="mb-6">
            <Select
              showSearch
              allowClear
              placeholder="Select or input a model type"
              optionFilterProp="children"
              options={options}
              onSearch={handleSearch}
              onChange={handleChange}
              onInputKeyDown={handleInputKeyDown}
            />
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
          <TabPane
            tab={
              <span>
                <FontAwesomeIcon icon={faCode} className="mr-2" />
                JSON Content
              </span>
            }
            key="jsonContent"
          />
          <TabPane tab="JSON Analysis" key="jsonAnalysis" />
          <TabPane tab="Training Logs" key="trainingLogs" />
        </Tabs>

        {/* Content area for the selected tab */}
        <div className="min-h-[500px]">
          {activeTab === "jsonContent" && (
            <CodeMirror
              value={jsonContent}
              height="500px"
              extensions={[json()]}
              // theme="dark"
              editable={false}
              className="border border-gray-300 rounded"
            />
          )}
          {activeTab === "jsonAnalysis" && (
            <CodeMirror
              value={parseJsonAnalysis(jsonContent)}
              height="500px"
              editable={false}
              className="border border-gray-300 rounded"
            />
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
