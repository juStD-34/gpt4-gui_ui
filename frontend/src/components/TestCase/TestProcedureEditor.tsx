import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Tooltip, message, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { storage, ref, getDownloadURL } from '../../utils/firebaseConfig';

const { TextArea } = Input;

interface TestProcedureEditorProps {
  value: string;
  onChange: (value: string) => void;
  imageList: TestImage[];
}

interface TestImage {
  id: number;
  name: string;
  imageUrl: string;
}

interface ImageMarker {
  startPos: number;
  endPos: number;
  imageId: number;
  originalText: string;
}

interface ImageUrlCache {
  [key: string]: string;
}

const TestProcedureEditor: React.FC<TestProcedureEditorProps> = ({ 
  value, 
  onChange, 
  imageList 
}) => {
  const [imageMarkers, setImageMarkers] = useState<ImageMarker[]>([]);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [selectionRange, setSelectionRange] = useState<{start: number, end: number} | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const [imageUrlCache, setImageUrlCache] = useState<ImageUrlCache>({});
  const [loadingImages, setLoadingImages] = useState<{[key: number]: boolean}>({});
  
  // Hàm tải URL hình ảnh từ Firebase
  const loadImageFromFirebase = async (imageUrl: string): Promise<string> => {
    try {
      // Kiểm tra xem URL đã được cache chưa
      if (imageUrlCache[imageUrl]) {
        return imageUrlCache[imageUrl];
      }
      
      // Kiểm tra nếu URL từ Firebase Storage
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        // Parse URL để lấy đường dẫn trong storage
        const urlPath = imageUrl.split('/o/')[1]?.split('?')[0];
        
        if (urlPath) {
          // Giải mã đường dẫn URL
          const decodedPath = decodeURIComponent(urlPath);
          
          // Tạo tham chiếu đến file
          const imageRef = ref(storage, decodedPath);
          
          // Lấy URL tải xuống
          const url = await getDownloadURL(imageRef);
          
          // Lưu vào cache
          setImageUrlCache(prev => ({...prev, [imageUrl]: url}));
          
          return url;
        }
      }
      
      // Nếu không phải URL Firebase hoặc không thể parse, sử dụng URL gốc
      setImageUrlCache(prev => ({...prev, [imageUrl]: imageUrl}));
      return imageUrl;
    } catch (err) {
      console.error(`Error loading image from Firebase:`, err);
      throw err;
    }
  };
  
  // Tải URL hình ảnh cho một ID cụ thể
  const loadImageUrlForId = async (imageId: number) => {
    const image = imageList.find(img => img.id === imageId);
    if (!image) return;
    
    setLoadingImages(prev => ({...prev, [imageId]: true}));
    
    try {
      await loadImageFromFirebase(image.imageUrl);
    } catch (error) {
      message.error(`Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingImages(prev => ({...prev, [imageId]: false}));
    }
  };
  
  // Xử lý khi focus vào textarea để lưu vị trí con trỏ
  const handleTextAreaFocus = () => {
    const textarea = document.getElementById('test-procedure-textarea') as HTMLTextAreaElement;
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
    }
  };
  
  // Xử lý khi click hoặc keyup trong textarea để cập nhật vị trí con trỏ
  const handleTextAreaPositionChange = () => {
    const textarea = document.getElementById('test-procedure-textarea') as HTMLTextAreaElement;
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
      
      // Nếu có văn bản được chọn
      if (textarea.selectionStart !== textarea.selectionEnd) {
        setSelectionRange({
          start: textarea.selectionStart,
          end: textarea.selectionEnd
        });
      } else {
        setSelectionRange(null);
      }
    }
  };
  
  // Xử lý khi người dùng click nút Thêm hình ảnh
  const handleAddImage = () => {
    const textarea = document.getElementById('test-procedure-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    // Kiểm tra nếu có văn bản được chọn
    if (textarea.selectionStart !== textarea.selectionEnd) {
      setSelectionRange({
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      });
      setIsReplaceMode(true);
    } else {
      setCursorPosition(textarea.selectionStart);
      setIsReplaceMode(false);
    }
    
    // Bắt đầu tải hình ảnh cho tất cả các mục trong danh sách
    imageList.forEach(image => {
      loadImageUrlForId(image.id);
    });
    
    setIsImageModalVisible(true);
  };
  
  // Xử lý khi người dùng chọn hình ảnh từ modal
  const handleImageSelect = (imageId: number) => {
    const selectedImage = imageList.find(img => img.id === imageId);
    if (!selectedImage) return;
    
    let newValue = value;
    let newMarker: ImageMarker;
    
    if (isReplaceMode && selectionRange) {
      // Trường hợp 1: Thay thế văn bản đã chọn
      const selectedText = value.substring(selectionRange.start, selectionRange.end);
      const imagePlaceholder = `[IMG:${imageId}:${selectedText}]`;
      
      newValue = 
        value.substring(0, selectionRange.start) + 
        imagePlaceholder + 
        value.substring(selectionRange.end);
      
      newMarker = {
        startPos: selectionRange.start,
        endPos: selectionRange.start + imagePlaceholder.length,
        imageId: imageId,
        originalText: selectedText
      };
    } else {
      // Trường hợp 2: Chèn hình ảnh tại vị trí con trỏ
      const imagePlaceholder = `[IMG:${imageId}:${selectedImage.name}]`;
      
      newValue = 
        value.substring(0, cursorPosition) + 
        imagePlaceholder + 
        value.substring(cursorPosition);
      
      newMarker = {
        startPos: cursorPosition,
        endPos: cursorPosition + imagePlaceholder.length,
        imageId: imageId,
        originalText: selectedImage.name
      };
    }
    
    setImageMarkers(prev => [...prev, newMarker]);
    onChange(newValue);
    setIsImageModalVisible(false);
    setSelectionRange(null);
    setShowPreview(true);
  };
  
  // Xử lý khi click vào hình ảnh để xem trước
  const handleImagePreview = async (imageUrl: string) => {
    setPreviewImage(null);
    setPreviewLoading(true);
    
    try {
      const finalUrl = await loadImageFromFirebase(imageUrl);
      setPreviewImage(finalUrl);
    } catch (err) {
      console.error("Error loading preview image:", err);
      message.error('Failed to load preview image');
    } finally {
      setPreviewLoading(false);
    }
  };
  
  // Cập nhật lại markers khi giá trị thay đổi
  useEffect(() => {
    const markerRegex = /\[IMG:(\d+):([^\]]+)\]/g;
    let match;
    const updatedMarkers: ImageMarker[] = [];
    
    while ((match = markerRegex.exec(value)) !== null) {
      const imageId = parseInt(match[1]);
      updatedMarkers.push({
        startPos: match.index,
        endPos: match.index + match[0].length,
        imageId: imageId,
        originalText: match[2]
      });
      
      // Tải hình ảnh cho marker này nếu chưa tải
      if (!loadingImages[imageId] && !imageUrlCache[imageId]) {
        loadImageUrlForId(imageId);
      }
    }
    
    setImageMarkers(updatedMarkers);
  }, [value]);
  
  // Hiển thị nội dung xem trước với hình ảnh
  const renderPreview = () => {
    if (!value || imageMarkers.length === 0) {
      return <div className="text-gray-500">Không có hình ảnh được chèn vào văn bản</div>;
    }
    
    let segments: React.ReactNode[] = [];
    let lastPos = 0;
    
    // Sắp xếp markers theo vị trí
    const sortedMarkers = [...imageMarkers].sort((a, b) => a.startPos - b.startPos);
    
    sortedMarkers.forEach((marker, index) => {
      // Thêm phần văn bản trước marker
      if (marker.startPos > lastPos) {
        segments.push(
          <span key={`text-${index}`} className="whitespace-pre-wrap">
            {value.substring(lastPos, marker.startPos)}
          </span>
        );
      }
      
      // Tìm và thêm hình ảnh
      const image = imageList.find(img => img.id === marker.imageId);
      if (image) {
        // Kiểm tra xem hình ảnh đang tải hay không
        const isLoading = loadingImages[marker.imageId];
        const cachedUrl = imageUrlCache[image.imageUrl];
        
        segments.push(
          <span 
            key={`img-${index}`} 
            className="inline-flex items-center mx-1 px-2 py-1 bg-blue-100 rounded-md"
          >
            {isLoading ? (
              <Spin size="small" className="h-6 w-6 mr-1" />
            ) : (
              <img 
                src={cachedUrl || image.imageUrl} 
                alt={marker.originalText}
                className="h-6 w-6 mr-1 object-cover cursor-pointer" 
                onClick={() => handleImagePreview(image.imageUrl)}
                onError={(e) => {
                  console.error(`Error displaying image: ${image.imageUrl}`);
                  e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
                  e.currentTarget.className = 'h-6 w-6 mr-1 text-red-500';
                }}
              />
            )}
            <span className="text-xs text-blue-600">{marker.originalText}</span>
          </span>
        );
      } else {
        // Nếu không tìm thấy hình ảnh
        segments.push(
          <span key={`unknown-${index}`} className="inline-flex items-center mx-1 px-2 py-1 bg-red-100 rounded-md">
            <span className="text-xs text-red-600">[Hình ảnh không tìm thấy: {marker.originalText}]</span>
          </span>
        );
      }
      
      lastPos = marker.endPos;
    });
    
    // Thêm phần văn bản còn lại
    if (lastPos < value.length) {
      segments.push(
        <span key="text-last" className="whitespace-pre-wrap">
          {value.substring(lastPos)}
        </span>
      );
    }
    
    return (
      <div className="p-3 border rounded bg-white">
        {segments}
      </div>
    );
  };

  // Render hình ảnh trong modal với xử lý tải
  const renderImageInModal = (image: TestImage) => {
    const isLoading = loadingImages[image.id];
    const cachedUrl = imageUrlCache[image.imageUrl];
    
    return (
      <div 
        key={image.id}
        className="border rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
        onClick={() => handleImageSelect(image.id)}
      >
        <div className="h-32 flex items-center justify-center overflow-hidden bg-gray-50">
          {isLoading ? (
            <Spin size="default" />
          ) : (
            <img 
              src={cachedUrl || image.imageUrl} 
              alt={image.name}
              className="max-h-32 max-w-full object-contain" 
              onError={(e) => {
                console.error(`Error loading image in modal: ${image.imageUrl}`);
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
                e.currentTarget.className = 'h-12 w-12 text-red-500';
              }}
            />
          )}
        </div>
        <div className="p-2 text-center text-sm truncate">{image.name}</div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2">
        {/* <div className="font-medium">Input Data and Test Procedure</div> */}
        <Tooltip title="Thêm hình ảnh vào vị trí con trỏ hoặc thay thế văn bản đã chọn">
          <Button 
            icon={<PlusOutlined />} 
            size="small"
            onClick={handleAddImage}
          >
            Thêm hình ảnh
          </Button>
        </Tooltip>
      </div>
      
      <TextArea
        id="test-procedure-textarea"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập các bước thực hiện test case (mỗi bước một dòng)"
        onFocus={handleTextAreaFocus}
        onClick={handleTextAreaPositionChange}
        onKeyUp={handleTextAreaPositionChange}
      />
      
      {imageMarkers.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <span className="font-medium">Xem trước</span>
            <Button 
              type="link" 
              size="small" 
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Ẩn" : "Hiển thị"}
            </Button>
            <span className="ml-2 text-xs text-gray-500">(Click vào hình để xem kích thước đầy đủ)</span>
          </div>
          
          {showPreview && renderPreview()}
        </div>
      )}
      
      {/* Modal chọn hình ảnh */}
      <Modal
        title={isReplaceMode ? "Chọn hình ảnh để thay thế văn bản" : "Chọn hình ảnh để chèn"}
        open={isImageModalVisible}
        onCancel={() => {
          setIsImageModalVisible(false);
          setSelectionRange(null);
        }}
        footer={null}
        width={700}
      >
        {isReplaceMode && selectionRange && (
          <div className="mb-4 p-2 bg-gray-100 rounded">
            <div className="text-sm text-gray-700 mb-1">Văn bản được chọn:</div>
            <div className="font-medium">"{value.substring(selectionRange.start, selectionRange.end)}"</div>
          </div>
        )}
        
        {!isReplaceMode && (
          <div className="mb-4 p-2 bg-blue-50 rounded">
            <div className="text-sm text-blue-700">
              Hình ảnh sẽ được chèn vào vị trí con trỏ hiện tại
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
          {imageList.map(image => renderImageInModal(image))}
          
          {imageList.length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              Không có hình ảnh. Vui lòng tải lên hình ảnh trước.
            </div>
          )}
        </div>
      </Modal>
      
      {/* Modal xem trước hình ảnh */}
      <Modal
        title="Xem hình ảnh đầy đủ"
        open={!!previewImage || previewLoading}
        onCancel={() => {
          setPreviewImage(null);
          setPreviewLoading(false);
        }}
        footer={null}
      >
        {previewLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : previewImage ? (
          <div className="flex justify-center">
            <img 
              src={previewImage} 
              alt="Xem trước"
              className="max-w-full max-h-[70vh]" 
              onError={(e) => {
                console.error(`Error loading preview image`);
                message.error('Failed to display preview image');
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
                e.currentTarget.className = 'w-24 h-24 text-red-500';
              }}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default TestProcedureEditor;