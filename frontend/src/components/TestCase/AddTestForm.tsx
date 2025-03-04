import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { TestCase } from '../../types/index';
import { TestCaseApi } from '../../utils/api';


interface AddTestFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (newTest: TestCase) => void;
  scenarioId: number | null;
  envId : number | null;
  exTest: TestCase | null;
}

const { TextArea } = Input;
const { Option } = Select;

const AddTestForm: React.FC<AddTestFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  scenarioId,
  envId, 
  exTest
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens or closes
  React.useEffect(() => {
    console.log("AddTestForm visible:", visible);
    if (visible) {
      form.resetFields();
      
      // Nếu có exTest, chỉ thiết lập giá trị cho trường websiteUrl
      if (exTest) {
        form.setFieldsValue({
          websiteUrl: exTest.websiteUrl
        });
      }
    }
  }, [visible, form, exTest]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!scenarioId) {
        message.error('Không tìm thấy scenario ID');
        return;
      }

      setLoading(true);
      
      // Prepare test case data
      const testCase: Partial<TestCase> = {
        testId: values.testId,
        testItem: values.testItem,
        testProcedure: values.testProcedure,
        websiteUrl: exTest ? exTest.websiteUrl : values.websiteUrl, // Sử dụng giá trị từ exTest nếu có
        testClassification: values.testClassification,
        expectedOutput: values.expectedOutput,
        environmentCondition: values.environmentCondition || 'N/A'
      };

      // Call API to add test case
      const response = await TestCaseApi.addTestCase(scenarioId, testCase);
      
      if (response.success && response.data) {
        message.success('Thêm test case thành công');
        onSuccess(response.data);
        onCancel(); // Close the modal
      } else {
        throw new Error(response.message || 'Không thể thêm test case');
      }
    } catch (error) {
      console.error('Lỗi khi thêm test case:', error);
      message.error(`Thêm test case thất bại: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm Test Case Mới"
      open={visible}
      visible={visible} // For compatibility with older Ant Design versions
      onCancel={onCancel}
      destroyOnClose={true}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading}
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Thêm
        </Button>,
      ]}
      width={700}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={true}
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="testId"
            label="ID"
            rules={[{ required: true, message: 'Vui lòng nhập ID' }]}
          >
            <Input placeholder="Nhập ID test case" />
          </Form.Item>

          <Form.Item
            name="testItem"
            label="Test Item"
            rules={[{ required: true, message: 'Vui lòng nhập Test Item' }]}
          >
            <Input placeholder="Nhập tên test item" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="testClassification"
            label="Test Classification"
            rules={[{ required: true, message: 'Vui lòng chọn phân loại test' }]}
          >
            <Select placeholder="Chọn phân loại">
              <Option value="Normal">Normal</Option>
              <Option value="Exception">Exception</Option>
              <Option value="Boundary">Boundary</Option>
              <Option value="Performance">Performance</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="websiteUrl"
            label="Website URL"
            rules={[{ required: true, message: 'Vui lòng nhập URL website' }]}
          >
            <Input 
              placeholder="Nhập URL website" 
              disabled={!!exTest} // Trường bị vô hiệu hóa nếu exTest tồn tại
              className={!!exTest ? "bg-gray-100" : ""} 
            />
          </Form.Item>
        </div>

        <Form.Item
          name="environmentCondition"
          label="Environment Condition"
        >
          <Input placeholder="Điều kiện môi trường (để trống nếu N/A)" />
        </Form.Item>

        <Form.Item
          name="testProcedure"
          label="Input Data and Test Procedure"
          rules={[{ required: true, message: 'Vui lòng nhập quy trình test' }]}
        >
          <TextArea 
            rows={6} 
            placeholder="Nhập các bước thực hiện test case (mỗi bước một dòng)" 
          />
        </Form.Item>

        <Form.Item
          name="expectedOutput"
          label="Expected Output"
          rules={[{ required: true, message: 'Vui lòng nhập kết quả mong đợi' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Nhập kết quả mong đợi (mỗi bước một dòng)" 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTestForm;