import { Button, Descriptions, Layout, Tabs, Modal, message } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import TabPane from "antd/es/tabs/TabPane";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_ENDPOINTS } from "../const";
import SeleniumCodeEditor from "./JavaEditor";
import FolderTree from "../components/Sidebar/FolderTree";
import { TestCase, TestImage, TestScenario } from "../types";
import { TestCaseApi, ImageApi, PredictionApi } from "../utils/api";
import AddTestForm from "../components/TestCase/AddTestForm";
import ImageViewer from "../components/ImageViewer/ImageViewer";
import EditTestForm from "../components/TestCase/EditTestForm";
import UploadImageModal from "../components/ImageViewer/UploadImage";
type Props = {};

const OpenEnv = (props: Props) => {
  const location = useLocation();
  const [testList, setTestList] = useState<Record<string, TestCase>>({});
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [imageList, setImageList] = useState<TestImage[]>([]); 
  const [scenarioData, setScenarioData] = useState<TestScenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("1");
  const [selectedImage, setSelectedImage] = useState<TestImage | null>(null);

  const [isAddTestModalVisible, setIsAddTestModalVisible] = useState(false);
  const [isEditTestModalVisible, setIsEditTestModalVisible] = useState(false);
  const [isUploadImageModalVisible, setIsUploadImageModalVisible] = useState(false);

  const { env } = (location.state as any) || {};

  const firstTestCase = scenarioData?.testData?.[0] || null;

  // Đảm bảo testData luôn có kiểu TestCase để tránh lỗi property không tồn tại
  const testData: TestCase = selectedTest && testList[selectedTest] 
    ? testList[selectedTest] 
    : {
        id: 0,
        testId: '',
        testItem: '',
        testProcedure: '',
        websiteUrl: '',
        testClassification: '',
        expectedOutput: '',
        environmentCondition: ''
      };

  const [modelPrediction, setModelPrediction] = useState<string>("");
  const [traditionalPrediction, setTraditionalPrediction] = useState<string>("");

  // Gọi API dự đoán 
  const callPredictionAPI = async (method: string) => {
    if (!selectedTest) {
      message.warning("Vui lòng chọn một test case để dự đoán");
      return;
    }
  
    setLoading(true);
    try {
      let response;
      if (method === "Model") {
        response = await PredictionApi.callModelPrediction(testData);
        
        if (!response.success || !response.data) {
          throw new Error(response.message || "Không thể lấy kết quả dự đoán");
        }
        
        // Extract response content
        const responseData = response.data.data?.[0]?.response;
  
        if (!responseData) {
          setModelPrediction("Không có dữ liệu phản hồi.");
          return;
        }
  
        try {
          // Parse the response data
          const parsedResponse = JSON.parse(responseData);
  
          // Extract predictions and split by commas
          const predictions = parsedResponse.predictions?.join(",") || "";
          const splitPredictions = predictions.split(",");
  
          // Add numbering and line breaks
          const formattedPredictions = splitPredictions
            .map((step: string, index: number) => `${index + 1}. ${step.trim()}`)
            .join("\n");
  
          // Update state with formatted predictions
          setModelPrediction(formattedPredictions);
        } catch (parseError) {
          console.error("Lỗi khi phân tích dữ liệu phản hồi:", parseError);
          setModelPrediction("Lỗi khi phân tích dữ liệu phản hồi.");
        }
      } else {
        // Traditional method
        response = await PredictionApi.callBFPrediction(testData);
        
        if (!response.success || !response.data) {
          throw new Error(response.message || "Không thể lấy kết quả dự đoán");
        }
        
        // Extract response content
        const responseData = response.data.data?.[0]?.response;
  
        if (!responseData) {
          setTraditionalPrediction("Không có dữ liệu phản hồi.");
          return;
        }
  
        try {
          // Parse the response data
          const parsedResponse = JSON.parse(responseData);
  
          // Extract predictions and split by commas
          const predictions = parsedResponse.predictions?.join(",") || "";
          const splitPredictions = predictions.split(",");
  
          // Add numbering and line breaks
          const formattedPredictions = splitPredictions
            .map((step: string, index: number) => `${index + 1}. ${step.trim()}`)
            .join("\n");
  
          // Update state with traditional prediction
          setTraditionalPrediction(formattedPredictions);
        } catch (parseError) {
          console.error("Lỗi khi phân tích dữ liệu phản hồi:", parseError);
          setTraditionalPrediction("Lỗi khi phân tích dữ liệu phản hồi.");
        }
      }
    } catch (error) {
      console.error(`Lỗi khi gọi API dự đoán (${method}):`, error);
      if (method === "Model") {
        setModelPrediction(`Lỗi: ${error instanceof Error ? error.message : "Không xác định"}`);
      } else {
        setTraditionalPrediction(`Lỗi: ${error instanceof Error ? error.message : "Không xác định"}`);
      }
    } finally {
      setLoading(false);
    }
  };
  // Handlers cho FolderTree
  const handleTestSelect = (testId: string) => {
    setSelectedTest(testId);
    // Reset các kết quả dự đoán khi chọn test case mới
    setModelPrediction("");
    setTraditionalPrediction("");

    setActiveTab("1");
  };

  const handleImageSelect = (image: TestImage) => {
    // Lưu ảnh được chọn vào state
    setSelectedImage(image);
    // Chuyển sang TabPane hình ảnh
    setActiveTab("3");
  };

  const handleAddTest = () => {
    console.log("handleAddTest called in OpenEnv");
    setIsAddTestModalVisible(true);
  };

  const handleAddTestSuccess = (newTest: TestCase) => {
    // Update the test list with the new test
    setTestList(prev => ({
      ...prev,
      [newTest.id.toString()]: newTest
    }));
    
    // Select the newly added test
    setSelectedTest(newTest.id.toString());
    
    // Switch to the test details tab
    setActiveTab("1");
  };
  const handleEditTest = (testId : string) => {
    // TODO: Implement giao diện chỉnh sửa test case
    // message.info(`Tính năng chỉnh sửa test case ${testId} đang được phát triển`);
    setIsEditTestModalVisible(true)
  };

  const handleEditTestSuccess = (updatedTest: TestCase) => {
    // Update the testList with the new test data
    setTestList(prevTestList => ({
      ...prevTestList,
      [updatedTest.id.toString()]: updatedTest
    }));
    
    // Set the selected test to the updated test
    setSelectedTest(updatedTest.id.toString());
    
    // Switch to the test details tab
    setActiveTab("1");
    
    // Show success message
    message.success('Test case updated successfully');
  };

  const handleDeleteTest = (testId: string, testName: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa test case "${testName}" không?`,
      onOk: async () => {
        try {
          setLoading(true);
          const response = await TestCaseApi.deleteTestCase(testId);
          
          if (response.success) {
            // Cập nhật danh sách test sau khi xóa
            const updatedTestList = { ...testList };
            delete updatedTestList[testId];
            setTestList(updatedTestList);
            
            if (selectedTest === testId) {
              setSelectedTest(null);
            }
            
            message.success('Xóa test case thành công');
          } else {
            throw new Error(response.message);
          }
        } catch (error) {
          console.error("Lỗi khi xóa test case:", error);
          message.error(`Xóa test case thất bại: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleAddImage = () => {
    // TODO: Implement giao diện upload hình ảnh
    message.info("Tính năng thêm hình ảnh đang được phát triển");
    setIsUploadImageModalVisible(true);
  };

  const handleAddImageSuccess = (newImage: TestImage) => {
    // Cập nhật danh sách hình ảnh với ảnh mới
    setImageList(prev => [...prev, newImage]);
    
    // Chọn ảnh mới được thêm vào
    setSelectedImage(newImage);
    
    // Chuyển sang tab xem ảnh
    setActiveTab("3");
  };
  

  const handleDeleteImage = (imageId: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa hình ảnh này không?',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await ImageApi.deleteImage(imageId);
          
          if (response.success) {
            // Cập nhật danh sách hình ảnh sau khi xóa
            const updatedImageList = imageList.filter(img => img.id !== imageId);
            setImageList(updatedImageList);
            
            // Nếu đang xem ảnh bị xóa, reset selectedImage và chuyển về tab 1
            if (selectedImage && selectedImage.id === imageId) {
              setSelectedImage(null);
              setActiveTab("1");
            }
            
            message.success('Xóa hình ảnh thành công');
          } else {
            throw new Error(response.message || 'Không thể xóa hình ảnh');
          }
        } catch (error) {
          console.error("Lỗi khi xóa hình ảnh:", error);
          message.error(`Xóa hình ảnh thất bại: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
        } finally {
          setLoading(false);
        }
      },
    });
  };
  
  const handleRenameImage = async (imageId: number, newName: string) => {
    try {
      setLoading(true);
      const response = await ImageApi.renameImage(imageId, newName);
      
      if (response.success && response.data) {
        // Cập nhật danh sách hình ảnh sau khi đổi tên
        const updatedImageList = imageList.map(img => 
          img.id === imageId ? { 
            ...img, 
            name: newName,
            // Cập nhật imageUrl nếu API trả về URL mới
            imageUrl: response.data.url || img.imageUrl
          } : img
        );
        setImageList(updatedImageList);
        
        // Cập nhật selectedImage nếu đang xem ảnh đó
        if (selectedImage && selectedImage.id === imageId) {
          setSelectedImage({
            ...selectedImage, 
            name: newName,
            // Cập nhật imageUrl nếu API trả về URL mới
            imageUrl: response.data.url || selectedImage.imageUrl
          });
        }
        
        message.success('Đổi tên hình ảnh thành công');
      } else {
        throw new Error(response.message || 'Không thể đổi tên hình ảnh');
      }
    } catch (error) {
      console.error("Lỗi khi đổi tên hình ảnh:", error);
      message.error(`Đổi tên hình ảnh thất bại: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.ENV_DETAILS + env);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const resData: TestScenario = await response.json();
        setScenarioData(resData);
        
        const testData = resData.testData || [];
        const images = resData.images || [];

        // Map các test case theo testItem để dễ tìm kiếm
        const mappedData = testData.reduce((acc, item) => {
          acc[item.id.toString()] = item;
          return acc;
        }, {} as Record<string, TestCase>);

        setTestList(mappedData);
        setImageList(images);
      } catch (error) {
        console.error("Lỗi khi tải môi trường:", error);
        message.error(`Lỗi khi tải dữ liệu: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
      } finally {
        setLoading(false);
      }
    };

    if (env) {
      fetchData();
    }
  }, [env]);

  return (
    <Layout className="h-full">
      <Sider theme={"light"} width={280} className="overflow-hidden border-r">
        <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="text-base font-medium m-0">
            {scenarioData?.name || "Test Scenario"}
          </h3>
        </div>
        <FolderTree
          testList={testList}
          imageList={imageList}
          onTestSelect={handleTestSelect}
          onImageSelect={handleImageSelect}
          onAddTest={handleAddTest}
          onAddImage={handleAddImage}
          onEditTest={handleEditTest}
          onDeleteTest={handleDeleteTest}
          onDeleteImage={handleDeleteImage}
          onRenameImage={handleRenameImage}
        />
      </Sider>
      <Content>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          style={{ minHeight: "400px", paddingLeft: "12px" }}
        >
          <TabPane tab="Test Case Details" key="1">
            <div className="w-full h-screen full mx-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  labelStyle={{ fontWeight: "bold", width: "200px" }}
                  contentStyle={{ whiteSpace: "pre-wrap" }}
                  // loading={loading}
                >
                  <Descriptions.Item label="ID">
                    {testData.testId || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Test Item">
                    {testData.testItem || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Test Classification">
                    {testData.testClassification || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Environment Condition">
                    {testData.environmentCondition || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Input Data and Test Procedure">
                    {testData.testProcedure || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Expected Output">
                    {testData.expectedOutput || "N/A"}
                  </Descriptions.Item>
                </Descriptions>

                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex flex-col items-center">
                      <Button
                        type="primary"
                        className="bg-blue-500 hover:bg-blue-600 w-64"
                        onClick={() => callPredictionAPI("Model")}
                        loading={loading}
                        disabled={!selectedTest}
                      >
                        Prediction by Model
                      </Button>
                      <div className="mt-2 min-h-[100px] border rounded-lg p-4 w-full">
                        <pre>{modelPrediction}</pre>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <Button
                        type="default"
                        className="border-blue-500 text-blue-500 hover:text-blue-600 hover:border-blue-600 w-64"
                        onClick={() => {callPredictionAPI("Traditional")}}
                        disabled={!selectedTest}
                      >
                        Prediction by Traditional Method
                      </Button>
                      <div className="mt-2 min-h-[100px] border rounded-lg p-4 w-full">
                        {traditionalPrediction}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPane>

          <TabPane tab="Code Editor" key="2">
            <div>
              <SeleniumCodeEditor />
            </div>
          </TabPane>
          
          <TabPane tab="Image Viewer" key="3">
            <div className="w-full p-6">
              {selectedImage ? (
                <div className="flex flex-col items-center w-full">
                  <div className="bg-white rounded-lg shadow-md w-full max-w-4xl">
                    <div className="flex justify-between items-center p-4 border-b">
                      <h3 className="text-lg font-medium">{selectedImage.name}</h3>
                      <div className="space-x-2">
                        <Button
                          type="text"
                          onClick={() => {
                            Modal.confirm({
                              title: 'Đổi tên hình ảnh',
                              content: (
                                <div className="mt-2">
                                  <input 
                                    type="text" 
                                    className="w-full p-2 border rounded"
                                    defaultValue={selectedImage.name}
                                    id="imageRenameInput"
                                  />
                                </div>
                              ),
                              onOk: () => {
                                const input = document.getElementById('imageRenameInput') as HTMLInputElement;
                                if (input && input.value.trim()) {
                                  handleRenameImage(selectedImage.id, input.value.trim());
                                }
                              }
                            });
                          }}
                        >
                          Đổi tên
                        </Button>
                        <Button
                          type="text"
                          danger
                          onClick={() => handleDeleteImage(selectedImage.id)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                    
                    <div className="h-[500px]">
                      <ImageViewer 
                        selectedImage={{
                          imageUrl: selectedImage.imageUrl,
                          name: selectedImage.name
                        }}
                        closeImage={() => {
                          // Optional: You could navigate back to another tab here
                          // or just set selectedImage to null
                          // setActiveTab("1");
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 border rounded-lg bg-gray-50">
                  <p className="text-gray-500">Chọn một hình ảnh từ danh sách bên trái để xem</p>
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Content>

      {/* Add Test Modal */}
      <AddTestForm 
        visible={isAddTestModalVisible}
        onCancel={() => {
          console.log("Canceling add test form");
          setIsAddTestModalVisible(false);
        }}
        onSuccess={handleAddTestSuccess}
        scenarioId={scenarioData?.id || null}
        envId = {env || null}
        exTest = {firstTestCase}
      />

      <EditTestForm
      visible = {isEditTestModalVisible}
      onCancel={()=>{
        console.log("Canceling edit test form")
        setIsEditTestModalVisible(false)
      }}
      onSuccess={handleEditTestSuccess}
      scenarioId={selectedTest && testList[selectedTest] 
      ? testList[selectedTest].id  : null}
      envId={ env || null}
      exTest={testList[selectedTest]}
      />

      <UploadImageModal
        visible={isUploadImageModalVisible}
        onCancel={() => {
          console.log("Canceling upload image");
          setIsUploadImageModalVisible(false);
        }}
        onSuccess={handleAddImageSuccess}
        envId={env || null}
      />
    </Layout>
  );
};

export default OpenEnv;