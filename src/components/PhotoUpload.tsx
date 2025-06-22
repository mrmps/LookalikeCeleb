
import React, { useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PhotoUploadProps {
  onImageUpload: (imageUrl: string) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = async () => {
    console.log('Camera button clicked');
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      console.log('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      console.log('Camera access granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current?.play();
        };
        setStream(mediaStream);
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      let errorMessage = 'Unable to access camera. ';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera permissions and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage += 'Camera not supported on this browser.';
        } else {
          errorMessage += error.message;
        }
      }
      
      alert(errorMessage + ' Please use gallery upload instead.');
    }
  };

  const takePicture = () => {
    console.log('Taking picture...');
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Flip the image horizontally for a mirror effect
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Picture taken successfully');
        onImageUpload(imageDataUrl);
        closeCamera();
      } else {
        console.error('Video not ready or context not available');
        alert('Camera not ready. Please wait a moment and try again.');
      }
    }
  };

  const closeCamera = () => {
    console.log('Closing camera...');
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  if (isCameraOpen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-black text-white">
          <h3 className="text-lg font-medium">Take a Photo</h3>
          <Button 
            onClick={closeCamera}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Video error:', e);
              alert('Video playback error. Please try again.');
            }}
          />
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <Button
              onClick={takePicture}
              className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 border-4 border-gray-300"
              size="icon"
            >
              <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-400" />
            </Button>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Upload Card */}
      <Card className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="space-y-3">
          <Button 
            onClick={handleUploadClick}
            className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-2xl text-lg shadow-sm active-scale"
          >
            <Upload className="w-5 h-5 mr-3" />
            Choose from Gallery
          </Button>

          <Button 
            onClick={handleCameraClick}
            className="w-full h-14 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-2xl text-lg shadow-sm active-scale"
          >
            <Camera className="w-5 h-5 mr-3" />
            Use Camera
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </Card>

      {/* Privacy Note */}
      <div className="bg-blue-50 rounded-2xl p-4 border-0">
        <p className="text-sm text-blue-800 text-center">
          <span className="font-medium">Privacy Protected:</span> Photos are processed securely and never stored
        </p>
      </div>
    </div>
  );
};

export default PhotoUpload;
