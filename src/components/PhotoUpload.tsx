
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
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, // Front camera
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions or use gallery upload.');
    }
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        // Flip the image horizontally for a mirror effect (typical for front camera)
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onImageUpload(imageDataUrl);
        closeCamera();
      }
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
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
            className="w-full h-full object-cover"
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
    <div className="space-y-6">
      {/* Main Upload Card */}
      <Card className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="space-y-4">
          <Button 
            onClick={handleUploadClick}
            className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-lg"
          >
            <Upload className="w-6 h-6 mr-3" />
            Choose from Gallery
          </Button>

          <Button 
            onClick={handleCameraClick}
            variant="outline"
            className="w-full h-14 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 text-lg"
          >
            <Camera className="w-6 h-6 mr-3" />
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
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <p className="text-sm text-blue-800 text-center">
          <span className="font-medium">Privacy Protected:</span> Photos are processed securely and never stored
        </p>
      </div>
    </div>
  );
};

export default PhotoUpload;
