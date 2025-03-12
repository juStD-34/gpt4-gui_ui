import React, { useEffect, useState } from 'react';
import { Modal, Spin, message } from 'antd';
import { TestImage } from '../../types';
import { storage, ref, getDownloadURL } from '../../utils/firebaseConfig';

interface TestCaseViewerProps {
  testProcedure: string;
  imageList: TestImage[];
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

const TestCaseViewer: React.FC<TestCaseViewerProps> = ({ testProcedure, imageList }) => {
  const [imageMarkers, setImageMarkers] = useState<ImageMarker[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  // Cache lưu trữ URLs đã tải để tránh tải lại nhiều lần
  const [imageUrlCache, setImageUrlCache] = useState<ImageUrlCache>({});
  const [loadingImages, setLoadingImages] = useState<{[key: number]: boolean}>({});
  
  // Phân tích cú pháp test procedure để tìm các markers
  useEffect(() => {
    if (!testProcedure) return;
    
    const markerRegex = /\[IMG:(\d+):([^\]]+)\]/g;
    let match;
    const markers: ImageMarker[] = [];
    
    while ((match = markerRegex.exec(testProcedure)) !== null) {
      markers.push({
        startPos: match.index,
        endPos: match.index + match[0].length,
        imageId: parseInt(match[1]),
        originalText: match[2]
      });
    }
    
    setImageMarkers(markers);
    
    // Khởi tạo trạng thái tải cho các hình ảnh
    const initialLoadingState: {[key: number]: boolean} = {};
    markers.forEach(marker => {
      initialLoadingState[marker.imageId] = true;
    });
    setLoadingImages(initialLoadingState);
    
    // Tiến hành tải các URL hình ảnh
    markers.forEach(marker => {
      const image = imageList.find(img => img.id === marker.imageId);
      if (image) {
        loadImageUrl(image.imageUrl, marker.imageId);
      }
    });
  }, [testProcedure, imageList]);
  
  // Hàm tải URL hình ảnh từ Firebase
  const loadImageUrl = async (imageUrl: string, imageId: number) => {
    // Nếu đã có trong cache, sử dụng lại
    if (imageUrlCache[imageUrl]) {
      setLoadingImages(prev => ({...prev, [imageId]: false}));
      return;
    }
    
    try {
      let finalUrl = imageUrl;
      
      // Kiểm tra xem có phải URL Firebase Storage không
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        // Parse URL để lấy đường dẫn trong storage
        const urlPath = imageUrl.split('/o/')[1]?.split('?')[0];
        
        if (urlPath) {
          // Giải mã đường dẫn URL
          const decodedPath = decodeURIComponent(urlPath);
          
          // Tạo tham chiếu đến file
          const imageRef = ref(storage, decodedPath);
          
          // Lấy URL tải xuống
          finalUrl = await getDownloadURL(imageRef);
        }
      }
      
      // Lưu vào cache
      setImageUrlCache(prev => ({...prev, [imageUrl]: finalUrl}));
    } catch (err) {
      console.error(`Error loading image ${imageId} from Firebase:`, err);
      message.error(`Failed to load image ${imageId}`);
    } finally {
      // Đánh dấu đã hoàn thành tải
      setLoadingImages(prev => ({...prev, [imageId]: false}));
    }
  };
  
  // Xử lý khi click vào hình ảnh để xem trước
  const handleImagePreview = async (imageUrl: string) => {
    setPreviewImage(null);
    setPreviewLoading(true);
    
    try {
      let finalUrl = imageUrl;
      
      // Kiểm tra xem có phải URL Firebase Storage không
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        // Parse URL để lấy đường dẫn trong storage
        const urlPath = imageUrl.split('/o/')[1]?.split('?')[0];
        
        if (urlPath) {
          // Giải mã đường dẫn URL
          const decodedPath = decodeURIComponent(urlPath);
          
          // Tạo tham chiếu đến file
          const imageRef = ref(storage, decodedPath);
          
          // Lấy URL tải xuống
          finalUrl = await getDownloadURL(imageRef);
        }
      }
      
      setPreviewImage(finalUrl);
    } catch (err) {
      console.error("Error loading preview image:", err);
      message.error('Failed to load preview image');
    } finally {
      setPreviewLoading(false);
    }
  };
  
  // Render nội dung với hình ảnh
  const renderContent = () => {
    if (!testProcedure) return 'N/A';
    
    if (imageMarkers.length === 0) {
      return <div className="whitespace-pre-wrap">{testProcedure}</div>;
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
            {testProcedure.substring(lastPos, marker.startPos)}
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
    if (lastPos < testProcedure.length) {
      segments.push(
        <span key="text-last" className="whitespace-pre-wrap">
          {testProcedure.substring(lastPos)}
        </span>
      );
    }
    
    return <div>{segments}</div>;
  };
  
  return (
    <>
      {renderContent()}
      
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
    </>
  );
};

export default TestCaseViewer;