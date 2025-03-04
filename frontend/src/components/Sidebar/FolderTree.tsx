import React, { useState, useEffect, useRef } from 'react';
import { Button, Dropdown, Menu, Tooltip, Modal, Form, Input, message } from 'antd';
import { 
  FolderOutlined, 
  FolderOpenOutlined, 
  FileOutlined, 
  FileImageOutlined,
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MoreOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { TestCase, TestImage } from '../../types/index';

interface FolderTreeProps {
  testList: Record<string, TestCase>;
  imageList: TestImage[];
  onTestSelect: (testKey: string) => void;
  onImageSelect: (image: TestImage) => void;
  onAddTest: () => void;
  onAddImage: () => void;
  onEditTest: (testKey: any) => void;
  onDeleteTest: (testKey: any) => void;
  onDeleteImage: (imageId: number) => void;
  onRenameImage?: (imageId: number, newName: string) => void;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  testList,
  imageList,
  onTestSelect,
  onImageSelect,
  onAddTest,
  onAddImage,
  onEditTest,
  onDeleteTest,
  onDeleteImage,
  onRenameImage
}) => {
  const [testFolderOpen, setTestFolderOpen] = useState(true);
  const [imageFolderOpen, setImageFolderOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuTarget, setContextMenuTarget] = useState<{ type: string; id: string | number } | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newImageName, setNewImageName] = useState('');
  const [currentImageId, setCurrentImageId] = useState<number | null>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuPosition(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle folder click
  const toggleFolder = (folderType: 'test' | 'image') => {
    if (folderType === 'test') {
      setTestFolderOpen(!testFolderOpen);
    } else {
      setImageFolderOpen(!imageFolderOpen);
    }
  };

  // Handle item selection
  const handleItemClick = (itemType: 'test' | 'image', id: string | number) => {
    if (itemType === 'test') {
      onTestSelect(id as string);
      setSelectedItem(`test-${id}`);
    } else {
      const selectedImage = imageList.find(img => img.id === id);
      if (selectedImage) {
        onImageSelect(selectedImage);
        setSelectedItem(`image-${id}`);
      }
    }
  };

  // Handle context menu
  const handleContextMenu = (
    e: React.MouseEvent, 
    targetType: 'testFolder' | 'test' | 'imageFolder' | 'image', 
    id?: string | number
  ) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuTarget({ 
      type: targetType, 
      id: id ? id.toString() : '' 
    });
  };

  // Handle menu item click based on context
  const handleMenuClick = (action: string) => {
    if (!contextMenuTarget) return;
    
    const { type, id } = contextMenuTarget;
    
    switch (type) {
      case 'testFolder':
        if (action === 'add') {
            onAddTest()
        }
        break;
      case 'test':
        if (action === 'edit') onEditTest(id);
        else if (action === 'delete') onDeleteTest(id);
        break;
      case 'imageFolder':
        if (action === 'upload') onAddImage();
        break;
      case 'image':
        if (action === 'delete') onDeleteImage(Number(id));
        else if (action === 'rename' && onRenameImage) {
          const imageToRename = imageList.find(img => img.id === Number(id));
          if (imageToRename) {
            setNewImageName(imageToRename.name);
            setCurrentImageId(Number(id));
            setRenameModalVisible(true);
          }
        }
        break;
    }
    
    setContextMenuPosition(null);
  };

  // Handle image rename
  const handleRename = () => {
    if (currentImageId !== null && onRenameImage) {
      onRenameImage(currentImageId, newImageName);
      setRenameModalVisible(false);
      setNewImageName('');
      setCurrentImageId(null);
    }
  };

  // Context menus for different item types
  const getContextMenu = (type: string): MenuProps => {
    switch (type) {
      case 'testFolder':
        return {
          items: [
            { key: 'add', label: 'Add Test Case', icon: <PlusOutlined /> },
          ],
          onClick: ({ key }) => {
            handleMenuClick(key)},
        };
      case 'test':
        return {
          items: [
            { key: 'edit', label: 'Edit', icon: <EditOutlined /> },
            { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true },
          ],
          onClick: ({ key }) => handleMenuClick(key),
        };
      case 'imageFolder':
        return {
          items: [
            { key: 'upload', label: 'Upload Image', icon: <PlusOutlined /> },
          ],
          onClick: ({ key }) => handleMenuClick(key),
        };
      case 'image':
        return {
          items: [
            { key: 'rename', label: 'Rename', icon: <EditOutlined /> },
            { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true },
          ],
          onClick: ({ key }) => handleMenuClick(key),
        };
      default:
        return { items: [] };
    }
  };

  return (
    <div className="w-full h-full overflow-auto p-2">
      {/* Test Cases Folder */}
      <div 
        className="mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded flex justify-between items-center"
        onClick={() => toggleFolder('test')}
        onContextMenu={(e) => handleContextMenu(e, 'testFolder')}
      >
        <div className="flex items-center">
          {testFolderOpen ? (
            <FolderOpenOutlined className="mr-2 text-blue-500" />
          ) : (
            <FolderOutlined className="mr-2 text-blue-500" />
          )}
          <span className="font-medium">Test Cases</span>
        </div>
        <Dropdown menu={getContextMenu('testFolder')} trigger={['click']}>
          <Button 
            type="text" 
            size="small" 
            icon={<MoreOutlined />}
            onClick={(e) => {
              handleContextMenu(e,'testFolder' )
              // e.stopPropagation()

            }}
          />
        </Dropdown>
      </div>
      
      {/* Test Case Items */}
      {testFolderOpen && (
        <div className="ml-4 space-y-1">
          {Object.entries(testList).map(([key, test]) => (
            <div
              key={`test-${key}`}
              className={`p-2 cursor-pointer rounded flex justify-between items-center ${
                selectedItem === `test-${key}` ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleItemClick('test', key)}
              onContextMenu={(e) => handleContextMenu(e, 'test', key)}
            >
              <div className="flex items-center truncate">
                <FileOutlined className="mr-2 text-gray-500" />
                <span className="truncate">{test.testItem}</span>
              </div>
              <Dropdown menu={getContextMenu('test')} trigger={['click']}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<MoreOutlined />}
                  onClick={(e) => {
                    handleContextMenu(e,'test', key )
                    // e.stopPropagation()
                  }}
                />
              </Dropdown>
            </div>
          ))}
        </div>
      )}
      
      {/* Images Folder */}
      <div 
        className="mb-2 mt-4 cursor-pointer hover:bg-gray-100 p-2 rounded flex justify-between items-center"
        onClick={() => toggleFolder('image')}
        onContextMenu={(e) => handleContextMenu(e, 'imageFolder')}
      >
        <div className="flex items-center">
          {imageFolderOpen ? (
            <FolderOpenOutlined className="mr-2 text-green-500" />
          ) : (
            <FolderOutlined className="mr-2 text-green-500" />
          )}
          <span className="font-medium">Images</span>
        </div>
        <Dropdown menu={getContextMenu('imageFolder')} trigger={['click']}>
          <Button 
            type="text" 
            size="small" 
            icon={<MoreOutlined />}
            onClick={(e) => {
              // e.stopPropagation()
              handleContextMenu(e, 'imageFolder')
            }}
          />
        </Dropdown>
      </div>
      
      {/* Image Items */}
      {imageFolderOpen && (
        <div className="ml-4 space-y-1">
          {imageList.map((image) => (
            <div
              key={`image-${image.id}`}
              className={`p-2 cursor-pointer rounded flex justify-between items-center ${
                selectedItem === `image-${image.id}` ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleItemClick('image', image.id)}
              onContextMenu={(e) => handleContextMenu(e, 'image', image.id)}
            >
              <div className="flex items-center truncate">
                <FileImageOutlined className="mr-2 text-green-500" />
                <span className="truncate">{image.name}</span>
              </div>
              <Dropdown menu={getContextMenu('image')} trigger={['click']}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<MoreOutlined />}
                  onClick={(e) => {
                    handleContextMenu(e, 'image', image.id)
                    // e.stopPropagation()
                  }}
                />
              </Dropdown>
            </div>
          ))}
        </div>
      )}
      
      {/* Custom context menu */}
      {contextMenuPosition && contextMenuTarget && (
        <div
          className="fixed bg-white shadow-lg rounded border z-50"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          <Menu {...getContextMenu(contextMenuTarget.type)} />
        </div>
      )}
      
      {/* Rename Modal */}
      <Modal
        title="Rename Image"
        open={renameModalVisible}
        onOk={handleRename}
        onCancel={() => setRenameModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="New Name">
            <Input 
              value={newImageName} 
              onChange={(e) => setNewImageName(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FolderTree;