
import React, { useState, useRef, useCallback } from 'react';
import { Camera, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FaceCaptureProps {
  onCapture: (imageUrl: string) => void;
  onBack: () => void;
}

const FaceCapture: React.FC<FaceCaptureProps> = ({ onCapture, onBack }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageUrl);
        setIsCapturing(true);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCapturing(false);
    startCamera();
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 text-white">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-white hover:bg-gray-800"
        >
          ← Back
        </Button>
        <h1 className="text-lg font-semibold">Face Capture</h1>
        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Camera/Preview Area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative w-full max-w-sm aspect-square">
          {/* Camera Viewfinder */}
          <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gray-900">
            {capturedImage ? (
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Face Detection Overlay */}
            {!capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-white rounded-full opacity-50 animate-pulse" />
              </div>
            )}
          </div>

          {/* Processing Indicator */}
          {isCapturing && !capturedImage && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-3xl">
              <div className="text-white text-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p>Processing...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 space-y-4">
        {capturedImage ? (
          <div className="flex gap-4">
            <Button 
              onClick={retakePhoto}
              variant="outline"
              className="flex-1 h-14 border-2 border-white text-white bg-transparent hover:bg-white hover:text-black rounded-2xl"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake
            </Button>
            <Button 
              onClick={confirmCapture}
              className="flex-1 h-14 bg-white text-black hover:bg-gray-200 rounded-2xl"
            >
              <Check className="w-5 h-5 mr-2" />
              Use Photo
            </Button>
          </div>
        ) : (
          <Button 
            onClick={capturePhoto}
            className="w-full h-16 bg-white text-black hover:bg-gray-200 rounded-2xl font-semibold text-lg"
          >
            <Camera className="w-6 h-6 mr-3" />
            Capture Photo
          </Button>
        )}
        
        <p className="text-center text-gray-400 text-sm">
          Position your face in the circle for best results
        </p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FaceCapture;
