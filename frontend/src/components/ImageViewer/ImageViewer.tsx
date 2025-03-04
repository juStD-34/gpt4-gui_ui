import React, { useState, useEffect } from 'react';
import { Button, Spin, message } from 'antd';
import { CloseOutlined, ZoomInOutlined, ZoomOutOutlined, UndoOutlined, DownloadOutlined } from '@ant-design/icons';
import { storage, ref, getDownloadURL } from '../../utils/firebaseConfig';

interface ImageViewerProps {
  selectedImage: {
    imageUrl: string;
    name?: string;
    description?: string;
  };
  closeImage: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ selectedImage, closeImage }) => {

  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadImageFromFirebase = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if the URL is a Firebase Storage URL
        if (selectedImage.imageUrl.includes('firebasestorage.googleapis.com')) {
          // Parse the URL to get the path in storage
          const urlPath = selectedImage.imageUrl.split('/o/')[1]?.split('?')[0];
          
          if (urlPath) {
            // Decode the URL path
            const decodedPath = decodeURIComponent(urlPath);
            
            // Create a reference to the file
            const imageRef = ref(storage, decodedPath);
            
            // Get the download URL
            const url = await getDownloadURL(imageRef);
            setImageUrl(url);
          } else {
            // If we can't parse the path, try using the URL directly
            setImageUrl(selectedImage.imageUrl);
          }
        } else {
          // Not a Firebase URL, use as is
          setImageUrl(selectedImage.imageUrl);
        }
      } catch (err) {
        console.error("Error loading image from Firebase:", err);
        setError(`Error loading image: ${err instanceof Error ? err.message : 'Unknown error'}`);
        message.error('Failed to load image from Firebase storage');
      } finally {
        setLoading(false);
      }
    };

    loadImageFromFirebase();
  }, [selectedImage.imageUrl]);
  
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 3));
  };
  
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
  };
  
  const resetZoom = () => {
    setScale(1);
  };
  
  const downloadImage = async () => {
    if (!imageUrl) return;
    
    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a temporary link and trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = selectedImage.name || 'downloaded-image.jpg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      message.success('Image downloaded successfully');
    } catch (err) {
      console.error("Error downloading image:", err);
      message.error('Failed to download image');
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center w-full p-2 border-b">
        <div className="flex gap-2">
          <Button 
            icon={<ZoomInOutlined />} 
            onClick={zoomIn}
            title="Zoom In"
            disabled={loading || !!error}
          />
          <Button 
            icon={<ZoomOutOutlined />} 
            onClick={zoomOut}
            title="Zoom Out"
            disabled={loading || !!error}
          />
          <Button 
            icon={<UndoOutlined />} 
            onClick={resetZoom}
            title="Reset Zoom"
            disabled={loading || !!error}
          />
          <Button
            icon={<DownloadOutlined />}
            onClick={downloadImage}
            title="Download Image"
            disabled={loading || !!error}
          />
        </div>
        <div className="flex items-center">
          {selectedImage.name && (
            <span className="mr-3 font-medium">{selectedImage.name}</span>
          )}
          <Button 
            icon={<CloseOutlined />} 
            onClick={closeImage}
            title="Close Image"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto flex justify-center items-center p-4 bg-gray-100">
        {loading ? (
          <div className="flex flex-col items-center">
            <Spin size="large" />
            <p className="mt-2">Loading image from Firebase Storage...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4 border border-red-300 rounded bg-red-50">
            <p>{error}</p>
            <p className="mt-2">Please check if the image exists in Firebase Storage.</p>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={selectedImage.description || selectedImage.name || 'Image'}
            style={{ 
              transform: `scale(${scale})`,
              transition: 'transform 0.2s ease-in-out',
              transformOrigin: 'center center',
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 150px)'
            }}
            onLoad={() => setLoading(false)}
          />
        ) : (
          <div className="text-gray-500 text-center">No image to display</div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;