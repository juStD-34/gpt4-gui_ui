import { Button, Descriptions, Layout, Tabs } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import TabPane from "antd/es/tabs/TabPane";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_ENDPOINTS, API_HOST } from "../const";
import SeleniumCodeEditor from "./JavaEditor";

type Props = {};

const OpenEnv = (props: Props) => {
  const location = useLocation();
  const [testList, setTestList] = useState<any | null>("abc");

  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const { env } = (location.state as any) || {};

  const testData = testList[selectedTest] || {};

  const [modelPrediction, setModelPrediction] = useState<string>("");
  const [traditionalPrediction, setTraditionalPrediction] =
    useState<string>("");

  const callPredictionAPI = async (setResult) => {
    try {
      const payload = createPayloadFromTestList();
      const response = await fetch(API_ENDPOINTS.PREDICTION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Gửi payload lên server
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        console.error("Prediction API error:", data.message);
        setResult(`Error: ${data.message}`);
      } else {
        console.log("Prediction API response:", data);

        // Extract response content
        const responseData = data.data?.[0]?.response;

        if (!responseData) {
          setResult("No response data available.");
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
            .map((step, index) => `${index + 1}. ${step.trim()}`)
            .join("\n");

          // Update state with formatted predictions
          setResult(formattedPredictions);
        } catch (parseError) {
          console.error("Failed to parse response data:", parseError);
          setResult("Error parsing response data.");
        }
      }
    } catch (error) {
      console.error("Failed to call Prediction API:", error.message);
      setResult(`Error: ${error.message}`);
    }
  };
  const createPayloadFromTestList = () => {
    if (!selectedTest || !testList[selectedTest]) {
      console.error("No selected test or data found in testList");
      return null;
    }

    const testData = testList[selectedTest];

    const payload = {
      config_id: 1, //TODO: set local config_id
      pred_list: [
        {
          testItem: testData.testItem,
          testProcedure: testData.testProcedure,
          expectedOutput: testData.expectedOutput,
          environmentCondition: testData.environmentCondition,
        },
      ],
    };
    console.log("TEST")
    return payload;
  };


  useEffect(() => {
    const fetchEnvironments = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ENV_DETAILS + env);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const resData = await response.json();
        const data = resData.testData || [];
        // const data = [
        //   {
        //     testProcedure:
        //       '1. Open http://webtest.ranorex.org/wp-login.php\n2. Fill "abc" into "Username" \n3. Fill "123" into "Password" field \n4. Click "Login" button',
        //     testItem: "Login_001",
        //     websiteUrl: "http://webtest.ranorex.org",
        //     testId: "1.0",
        //     testClassification: "Check login fail",
        //     expectedOutput:
        //       '1. Login page is opened\n2. Validate "abc" is filled into "Username" field\n3. Validate "123" is filled into "Password" field\n4. Could not log in with error message: "Username is invalid"',
        //     environmentCondition: "Abnormal",
        //   },
        //   {
        //     testProcedure:
        //       '1. Open http://webtest.ranorex.org/wp-login.php\n2. Fill "ranorex webtest" into "Username" \n3. Fill "ranorex" into "Password" field \n4. Click "Login" button',
        //     testItem: "Login_002",
        //     websiteUrl: "http://webtest.ranorex.org",
        //     testId: "2.0",
        //     testClassification: "Check login successfully ",
        //     expectedOutput:
        //       '4.1. Log in successfully. New page is opened with title is "Dashboard"\n4.2. Exist "Dashboard" , "Posts", "Media", "Comments", "Tools", "Collapse menu"',
        //     environmentCondition: "Normal",
        //   },
        //   {
        //     testProcedure:
        //       '1. Click "Posts" item in left menu \n2. Click "Add New" item \n3. Fill "TitleTestRanorex" into "Enter title here" placeholder\n4. Fill "Test creating new post" into text-area \n5. Click "Publish" button\n6. Click "View post" hyper link',
        //     testItem: "AddPost_001",
        //     websiteUrl: "http://webtest.ranorex.org",
        //     testId: "3.0",
        //     testClassification: "Add new post ",
        //     expectedOutput:
        //       '1. "Posts" page is opened\n5. New post is created successfully: \n- Page change to "Edit Post"\n- Display "Post published. View post" \n6. Navigate to new post',
        //     environmentCondition: "Normal",
        //   },
        // ];

        const mappedData = data.reduce((acc, item) => {
          acc[item.testItem] = {
            testProcedure: item.testProcedure,
            testItem: item.testItem,
            websiteUrl: item.websiteUrl,
            testId: item.testId,
            testClassification: item.testClassification,
            expectedOutput: item.expectedOutput,
            environmentCondition: item.environmentCondition,
          };
          return acc;
        }, {});

        setTestList(mappedData);
      } catch (error) {
        console.error("Failed to load environments:", error);
      }
    };

    fetchEnvironments();
  }, [env]);

  return (
    <Layout className="h-full">
      <Sider theme={"light"} className="flex items-center pt-12">
        {Object.keys(testList).map((key) => (
          <Button
            className={`w-full text-center ${selectedTest === key ? "bg-blue-500" : "bg-white"
              }`}
            key={key}
            onClick={() => setSelectedTest(key)}
          >
            {key}
          </Button>
        ))}
      </Sider>
      <Content>
        <Tabs
          defaultActiveKey="1"
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
                >
                  <Descriptions.Item label="ID">
                    {testData.testId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Test Item">
                    {testData.testItem}
                  </Descriptions.Item>
                  <Descriptions.Item label="Test Classification">
                    {testData.testClassification}
                  </Descriptions.Item>
                  <Descriptions.Item label="Environment Condition">
                    {testData.environmentCondition}
                  </Descriptions.Item>
                  <Descriptions.Item label="Input Data and Test Procedure">
                    {testData.testProcedure}
                  </Descriptions.Item>
                  <Descriptions.Item label="Expected Output">
                    {testData.expectedOutput}
                  </Descriptions.Item>
                </Descriptions>

                <div className="space-y-4">

                  <div className="space-y-4">
                    <div className="flex flex-col items-center">
                      <Button
                        type="primary"
                        className="bg-blue-500 hover:bg-blue-600 w-64"
                        onClick={() => {
                          callPredictionAPI(setModelPrediction);
                          // setModelPrediction("Sample model prediction result");
                        }}
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
                        onClick={() => {
                          // TODO: API call will go here
                          console.log("Predicting by Traditional method...");
                          setTraditionalPrediction(
                            "Sample traditional prediction result"
                          );
                        }}
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
        </Tabs>
      </Content>
    </Layout>
  );
};

export default OpenEnv;
