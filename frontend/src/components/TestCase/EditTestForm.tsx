import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { TestCase } from '../../types/index';
import { TestCaseApi } from '../../utils/api';

interface EditTestFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (test: TestCase) => void;
  exTest: TestCase | null;
  scenarioId: number | null;
  envId: number | null;
}

const { TextArea } = Input;
const { Option } = Select;

const EditTestForm: React.FC<EditTestFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  exTest,
  scenarioId,
  envId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Set form values when modal opens or exTest changes
  useEffect(() => {
    if (visible && exTest) {
      form.setFieldsValue({
        testId: exTest.testId,
        testItem: exTest.testItem,
        testProcedure: exTest.testProcedure,
        websiteUrl: exTest.websiteUrl,
        testClassification: exTest.testClassification,
        expectedOutput: exTest.expectedOutput,
        environmentCondition: exTest.environmentCondition || 'N/A'
      });
    }
  }, [visible, exTest, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!scenarioId || !exTest) {
        message.error('Không tìm thấy thông tin test case hoặc scenario ID');
        return;
      }

      setLoading(true);
      
      // Prepare updated test case data
      const updatedTestCase: TestCase = {
        ...exTest,
        testId: values.testId,
        testItem: values.testItem,
        testProcedure: values.testProcedure,
        websiteUrl: values.websiteUrl,
        testClassification: values.testClassification,
        expectedOutput: values.expectedOutput,
        environmentCondition: values.environmentCondition || 'N/A'
      };

      // Call API to update test case
      const response = await TestCaseApi.updateTestCase(exTest.id, updatedTestCase);

      
      if (response.success && response.data) {
        message.success('Cập nhật test case thành công');
        onSuccess(response.data);
        onCancel(); // Close the modal
      } else {
        throw new Error(response.message || 'Không thể cập nhật test case');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật test case:', error);
      message.error(`Cập nhật test case thất bại: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh Sửa Test Case"
      open={visible}
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
          Lưu Thay Đổi
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
            <Input placeholder="Nhập ID test case"
            disabled = {true} />
          </Form.Item>

          <Form.Item
            name="testItem"
            label="Test Item"
            rules={[{ required: true, message: 'Vui lòng nhập Test Item' }]}
          >
            <Input placeholder="Nhập tên test item"
            disabled = {true} />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="testClassification"
            label="Test Classification"
            rules={[{ required: true, message: 'Vui lòng chọn phân loại test' }]}
          >
            {/* <Select placeholder="Chọn phân loại">
              <Option value="Normal">Normal</Option>
              <Option value="Exception">Exception</Option>
              <Option value="Boundary">Boundary</Option>
              <Option value="Performance">Performance</Option>
            </Select> */}
            <Input placeholder='Test classification'
            disabled={true}
            />
          </Form.Item>

          <Form.Item
            name="websiteUrl"
            label="Website URL"
            rules={[{ required: true, message: 'Vui lòng nhập URL website' }]}
          >
            <Input 
            placeholder="Nhập URL website" 
            disabled = {true}
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

export default EditTestForm;