import React, { useEffect, useState } from "react";
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
  Spin,
  Alert,
  Space,
  Tooltip,
  Typography
} from "antd";
import { UploadOutlined, InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faChartBar, faTerminal } from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "../const";
import { ModelOption, ConfigOption, TrainingFormData  } from "../types";
import TrainingLog from "../components/Training/TrainingLog";
import { useConfig } from "../context/ConfigContext";

const { Sider, Content } = Layout;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Define proper types

const TrainModel: React.FC = () => {
  const {configId, selectedConfig} = useConfig();

  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>("jsonContent");
  const [jsonContent, setJsonContent] = useState<string>("");
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([
    { value: "Salesforce/codet5-small", label: "CodeT5 Small" },
    { value: "Salesforce/codet5-base", label: "CodeT5 Base" },
    { value: "Salesforce/codet5-large", label: "CodeT5 Large" },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [trainingId, setTrainingId] = useState<string | undefined>(undefined);
  const [configOptions] = useState<ConfigOption[]>([
    { value: 1, label: "Colab" },
    { value: 2, label: "Local" },
  ]);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);

  const onFinish = async (values: TrainingFormData) => {
    if (!values.trainingSet?.fileList?.[0]?.originFileObj) {
      message.error("Please select a training file");
      return;
    }
  
    if (!values.modelType || values.modelType.length === 0) {
      message.error("Please select a model type");
      return;
    }
  
    // Tạo trainingId ngay từ frontend
    const newTrainingId = `training-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Thiết lập trainingId và trạng thái training trước khi gọi API
    setTrainingId(newTrainingId);
    setIsSubmitting(true);
    
    // Chuyển đến tab logs ngay lập tức
    setActiveTab("trainingLogs");
  
    try {
      // Tạo FormData object
      const formData = new FormData();
      formData.append("file", values.trainingSet.fileList[0].originFileObj);
      
      const modelTypeValue = Array.isArray(values.modelType) ? values.modelType[0] : values.modelType;
      formData.append("modelType", modelTypeValue);
      formData.append("epochs", String(values.epochs || 1));
      formData.append("outputDir", values.outputDirectory || "");
      formData.append("loggingDir", values.loggingDirectory || "");
      formData.append("configId", String(configId));
      formData.append("trainingId", newTrainingId); // Gửi trainingId xuống backend
  
      const response = await fetch(API_ENDPOINTS.TRAIN, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        setIsSubmitting(false)
        throw new Error(`HTTP error: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || "Training failed");
      }
      setIsSubmitting(false)
      message.success("Training started successfully!");
    } catch (error) {
      console.error("API Error:", error);
      message.error("Failed to start training: " + (error instanceof Error ? error.message : "Unknown error"));
      setIsSubmitting(false);
      // Không cần reset trainingId vì user có thể muốn xem logs bất kể lỗi API
    }
  };

  // Handle training log errors
  const handleTrainingLogError = (errorMessage: string) => {
    console.error("Training log error:", errorMessage);
    message.error(`Error fetching training logs: ${errorMessage}`);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
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
    const { fileList } = info;
    
    // Handle file removal
    if (fileList.length === 0) {
      setJsonContent("");
      setFileUploaded(false);
      return;
    }
    
    const file = fileList[0];
    if (file && file.originFileObj) {
      try {
        // Read the raw file content
        const content = await readFileContent(file.originFileObj);
        // Store the raw content for analysis, which will be parsed differently
        const rawContent = content;

        try {
          // Parse JSONL format (each line is a separate JSON object)
          const lines = content.trim().split('\n');
          const jsonArray = [];
          
          // Parse each line individually and handle errors gracefully
          for (let i = 0; i < lines.length; i++) {
            try {
              if (lines[i].trim()) {  // Skip empty lines
                const parsedLine = JSON.parse(lines[i]);
                jsonArray.push(parsedLine);
              }
            } catch (lineError) {
              console.warn(`Error parsing line ${i+1}: ${lineError.message}`);
              // Continue with next line instead of failing completely
            }
          }
          
          if (jsonArray.length === 0) {
            throw new Error("No valid JSON objects found in file");
          }
          
          // Pretty-print the parsed JSON for display
          setJsonContent(JSON.stringify(jsonArray, null, 2));
          setFileUploaded(true);
          message.success(`${file.name} uploaded with ${jsonArray.length} valid entries`);
        } catch (error) {
          console.error("JSON parsing error:", error);
          message.error(`Failed to parse JSON: ${error.message}`);
          // Still store the raw content so user can see what was uploaded
          setJsonContent(rawContent);
        }
      } catch (error) {
        console.error("File reading error:", error);
        message.error(`Failed to read file: ${error.message}`);
      }
    }
  };

  const parseJsonAnalysis = (jsonContent: string): string => {
    if (!jsonContent) return "No content to analyze. Please upload a file first.";
    
    try {
      let dataArray;
      
      // Determine if the content is already parsed JSON or JSONL format
      try {
        // First try to parse as complete JSON array
        dataArray = JSON.parse(jsonContent);
      } catch (parseError) {
        // If that fails, try to parse as JSONL (each line is a JSON object)
        const lines = jsonContent.trim().split('\n');
        dataArray = lines.map(line => JSON.parse(line));
      }
  
      // Count summaries for each aURL
      const aURLCounts: { [key: string]: { summaries: Set<string> } } = {};
  
      dataArray.forEach((item: { aURL: string; bSummary: string }) => {
        const { aURL, bSummary } = item;
        if (!aURL || !bSummary) {
          console.warn("Item missing aURL or bSummary:", item);
          return; // Skip this item instead of throwing error
        }
        
        if (aURL in aURLCounts) {
          aURLCounts[aURL].summaries.add(bSummary);
        } else {
          aURLCounts[aURL] = { summaries: new Set([bSummary]) };
        }
      });
  
      // Sort by number of summaries (descending)
      const sortedAURLCounts = Object.entries(aURLCounts).sort(
        (a, b) => b[1].summaries.size - a[1].summaries.size
      );
  
      // Create analysis result string
      if (sortedAURLCounts.length === 0) {
        return "No valid data found for analysis.";
      }
      
      const analysisResult = sortedAURLCounts
        .map(([aURL, data]) => {
          const summaryList = Array.from(data.summaries)
            .map(summary => `- ${summary}`)
            .join("\n");
          return `${aURL} (${data.summaries.size} test scenarios)\n${summaryList}`;
        })
        .join("\n\n");
  
      return analysisResult;
    } catch (error) {
      console.error("Error analyzing JSON:", error);
      return `Failed to analyze JSON content: ${error.message}\nPlease ensure the format is correct and try again.`;
    }
  };

  const handleSearch = (value: string) => {
    setInputValue(value);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (
      event.key === "Enter" &&
      inputValue &&
      !modelOptions.some((option) => option.value === inputValue)
    ) {
      const newOption = { value: inputValue, label: inputValue };
      setModelOptions((prevOptions) => [...prevOptions, newOption]);
      form.setFieldsValue({ modelType: [inputValue] });
      setInputValue("");
    }
  };

  const handleModelChange = (value: string[]) => {
    // If user enters a new model type, add it to options
    const lastValue = value[value.length - 1];
    if (lastValue && !modelOptions.some((option) => option.value === lastValue)) {
      const newOption = { value: lastValue, label: lastValue };
      setModelOptions((prevOptions) => [...prevOptions, newOption]);
    }
  };

  // Reset form on component mount
  useEffect(() => {
    form.setFieldsValue({
      configId: 1,
      epochs: 1,
    });
  }, [form]);

  return (
    <Layout className="min-h-screen">
      <Sider
        width={320}
        className="bg-white p-4 overflow-y-auto"
        style={{ borderRight: "1px solid #f0f0f0" }}
      >
        <div className="mb-4">
          <Title level={4}>Model Training</Title>
          <Text type="secondary">Configure and start model training process</Text>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={isSubmitting}
          initialValues={{ configId: 1, epochs: 1 }}
          className="space-y-4"
        >
          {/* Training Set Upload */}
          <Form.Item
            label={
              <Space>
                <span>Training set (JSONL)</span>
                <Tooltip title="Upload JSON Lines file with training data. Each line should be a valid JSON object.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
            name="trainingSet"
            rules={[{ required: true, message: 'Please upload a training set' }]}
            className="mb-5"
          >
            <Upload
              accept=".json,.jsonl"
              beforeUpload={() => false}
              onChange={handleFileChange}
              maxCount={1}
              className="w-full"
            >
              <Button icon={<UploadOutlined />} className="w-full">
                {fileUploaded ? "Change File" : "Choose File"}
              </Button>
            </Upload>
          </Form.Item>

          {/* Training Epochs */}
          <Form.Item 
            label={
              <Space>
                <span>Training Epochs</span>
                <Tooltip title="Number of complete passes through the training dataset">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
            name="epochs"
            rules={[{ required: true, message: 'Please input number of epochs' }]}
            className="mb-5"
          >
            <InputNumber className="w-full" min={1} max={100} />
          </Form.Item>

          {/* Model Type */}
          <Form.Item 
            label={
              <Space>
                <span>Model Type</span>
                <Tooltip title="Select an existing model or enter a new one">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
            name="modelType"
            rules={[{ required: true, message: 'Please select a model type' }]}
            className="mb-5"
          >
            <Select
              mode="tags"
              showSearch
              allowClear
              placeholder="Select or input a model type"
              optionFilterProp="children"
              options={modelOptions}
              onSearch={handleSearch}
              onChange={handleModelChange}
              onInputKeyDown={handleInputKeyDown}
            />
          </Form.Item>

          {/* Advanced Settings Divider */}
          <div className="border-t border-gray-200 my-6 pt-2">
            <Text strong>Advanced Settings</Text>
          </div>

          {/* Logging Directory */}
          <Form.Item
            label={
              <Space>
                <span>Logging Directory</span>
                <Tooltip title="Directory to save training logs (required for Colab)">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            name="loggingDirectory"
            className="mb-5"
            extra={<Text type="secondary" className="text-xs">Start with /content/drive/MyDrive/ (Colab only)</Text>}
          >
            <Input placeholder="/content/drive/MyDrive/training_logs" />
          </Form.Item>

          {/* Output Directory */}
          <Form.Item
            label={
              <Space>
                <span>Output Directory</span>
                <Tooltip title="Directory to save the trained model (required for Colab)">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            name="outputDirectory"
            className="mb-5"
            extra={<Text type="secondary" className="text-xs">Start with /content/drive/MyDrive/ (Colab only)</Text>}
          >
            <Input placeholder="/content/drive/MyDrive/model_output" />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item className="mb-0 mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={!fileUploaded}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="large"
            >
              {isSubmitting ? "Training..." : "Start Training"}
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
          <TabPane 
            tab={
              <span>
                <FontAwesomeIcon icon={faChartBar} className="mr-2" />
                JSON Analysis
              </span>
            } 
            key="jsonAnalysis" 
          />
          <TabPane 
            tab={
              <span>
                <FontAwesomeIcon icon={faTerminal} className="mr-2" />
                Training Logs
              </span>
            } 
            key="trainingLogs" 
          />
        </Tabs>

        <div className="min-h-[600px] border border-gray-200 rounded-md overflow-hidden">
          {activeTab === "jsonContent" && (
            <>
              {jsonContent ? (
                <CodeMirror
                  value={jsonContent}
                  height="600px"
                  extensions={[json()]}
                  editable={false}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 text-gray-500 p-6">
                  <div className="text-center">
                    <UploadOutlined style={{ fontSize: '2rem' }} />
                    <p className="mt-2">Upload a JSON Lines file to see content here</p>
                  </div>
                </div>
              )}
            </>
          )}
          
          {activeTab === "jsonAnalysis" && (
            <>
              {jsonContent ? (
                <CodeMirror
                  value={parseJsonAnalysis(jsonContent)}
                  height="600px"
                  editable={false}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 text-gray-500 p-6">
                  <div className="text-center">
                    <UploadOutlined style={{ fontSize: '2rem' }} />
                    <p className="mt-2">Upload a JSON Lines file to see analysis here</p>
                  </div>
                </div>
              )}
            </>
          )}
          
          {activeTab === "trainingLogs" && (
            <div className="h-full">
              <TrainingLog 
                trainingId={trainingId}
                isTraining={isSubmitting}
                onError={handleTrainingLogError}
                onTrainingError={() => {
                  // Reset isSubmitting when training error is detected in logs
                  setIsSubmitting(false);
                  message.error("Training failed. Check logs for details.");
                }}
                onTrainingComplete={() => {
                  setIsSubmitting(false);
                  message.success("Training completed successfully!");
                }}
              />
            </div>
          )}
        </div>
        
        {/* Bottom error handling area */}
        {isSubmitting && (
          <div className="mt-4">
            <Alert
              message="Training in Progress"
              description="Please do not close this window. The training process might take a while depending on your configuration."
              type="info"
              showIcon
            />
          </div>
        )}
      </Content>
    </Layout>
  );
};


export default TrainModel;


// /home/justd/Desktop/checkpoint-1955-20250305T155012Z-001/checkpoint-1955