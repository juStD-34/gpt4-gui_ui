import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { ImageApi } from '../../utils/api';
import { TestImage } from '../../types';

interface UploadImageModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (newImage: TestImage) => void;
  envId: number | null;
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  envId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, form]);

  // Handle file change
  const handleChange = ({ fileList }: { fileList: UploadFile[] }) => {
    // Limit to only one file
    const newFileList = fileList.slice(-1);
    setFileList(newFileList);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!envId) {
        message.error('Không tìm thấy environment ID');
        return;
      }
      
      if (fileList.length === 0) {
        message.error('Vui lòng chọn một hình ảnh để tải lên');
        return;
      }

      setLoading(true);
      
      // Get the file object from the upload control
      const file = fileList[0].originFileObj;
      if (!file) {
        message.error('Không thể đọc file đã chọn');
        return;
      }
      
      // Call API to upload image
      const response = await ImageApi.uploadImage(envId.toString(), file, values.name);
      
      if (response.success && response.data) {
        message.success('Tải lên hình ảnh thành công');
        onSuccess({
          id: response.data.id,
          name: values.name,
          imageUrl: response.data.imageUrl
        });
        onCancel(); // Close the modal
      } else {
        throw new Error(response.message || 'Không thể tải lên hình ảnh');
      }
    } catch (error) {
      console.error('Lỗi khi tải lên hình ảnh:', error);
      message.error(`Tải lên hình ảnh thất bại: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tải lên hình ảnh mới"
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
          Tải lên
        </Button>,
      ]}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={true}
      >
        <Form.Item
          name="name"
          label="Tên hình ảnh"
          rules={[{ required: true, message: 'Vui lòng nhập tên cho hình ảnh' }]}
        >
          <Input placeholder="Nhập tên cho hình ảnh" />
        </Form.Item>

        <Form.Item
          name="file"
          label="Chọn hình ảnh"
          valuePropName="fileList"
          getValueFromEvent={e => e && e.fileList}
          rules={[{ required: true, message: 'Vui lòng chọn một hình ảnh để tải lên' }]}
        >
          <Upload
            beforeUpload={() => false} // Prevent auto upload
            fileList={fileList}
            onChange={handleChange}
            accept="image/*" // Only accept image files
            maxCount={1} // Only allow one file
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadImageModal;