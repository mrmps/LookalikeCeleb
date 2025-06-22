import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload, X, AlertCircle, Clipboard } from 'lucide-react';
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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pasteHint, setPasteHint] = useState(false);
  const [isMac, setIsMac] = useState(false);

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

  const handlePasteImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUpload(result);
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          handlePasteImage(file);
          setPasteHint(false);
        }
        break;
      }
    }
  }, [handlePasteImage]);

  // Add global paste event listener and detect platform
  useEffect(() => {
    // Detect Mac platform
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        setPasteHint(true);
        setTimeout(() => setPasteHint(false), 2000);
      }
    };

    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePaste]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const closeCamera = useCallback(() => {
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
      videoRef.current.load();
    }
    setIsCameraOpen(false);
    setIsLoading(false);
    setCameraError(null);
  }, [stream]);

  const handleCameraClick = async () => {
    console.log('Camera button clicked');
    setIsLoading(true);
    setCameraError(null);

    try {
      // HTTPS / localhost check
      if (!window.location.hostname.includes('localhost') && window.location.protocol !== 'https:') {
        throw new Error('Camera requires HTTPS connection');
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this browser');
      }

      // Attempt to get user-facing camera first, fallback to any camera
      const constraintsPrimary: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      const constraintsFallback: MediaStreamConstraints = {
        video: true,
        audio: false
      };

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraintsPrimary);
      } catch (err) {
        console.warn('Primary camera constraints failed, trying fallback:', err);
        mediaStream = await navigator.mediaDevices.getUserMedia(constraintsFallback);
      }

      // Save stream and open camera overlay. Actual binding to video element
      // will happen in a separate useEffect once the overlay (and <video>) is mounted.
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (error) {
      console.error('Camera error:', error);
      setIsLoading(false);
      let message = 'Unable to access camera.';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') message = 'Camera permission denied. Please enable permission and try again.';
        else if (error.name === 'NotFoundError') message = 'No camera found on this device.';
        else if (error.name === 'NotSupportedError') message = 'Camera not supported on this browser.';
        else if (error.name === 'NotReadableError') message = 'Camera is already in use by another application.';
        else if (error.message.includes('HTTPS')) message = 'Camera requires a secure HTTPS connection.';
        else message = error.message;
      }
      setCameraError(message);
    }
  };

  // Attach stream to video element when overlay is open & stream available
  React.useEffect(() => {
    if (!isCameraOpen || !stream || !videoRef.current) return;

    const video = videoRef.current;
    video.srcObject = stream;

    const finishLoading = () => {
      setIsLoading(false);
      cleanup();
    };

    const timeoutId = window.setTimeout(() => {
      setCameraError('Camera is taking too long to start. Please try again.');
      setIsLoading(false);
      cleanup();
    }, 8000);

    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('canplay', onReady);
      clearTimeout(timeoutId);
    };

    const onReady = () => {
      video.play().catch(e => {
        console.error('video.play failed', e);
        setCameraError('Could not start camera preview');
      }).finally(finishLoading);
    };

    video.addEventListener('loadedmetadata', onReady, { once: true });
    video.addEventListener('canplay', onReady, { once: true });

    // If readyState already sufficient
    if (video.readyState >= 2) onReady();

    return cleanup;
  }, [isCameraOpen, stream]);

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
        setCameraError('Camera not ready. Please wait a moment and try again.');
      }
    }
  };

  if (isCameraOpen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
          <h3 className="text-white text-lg font-light">Position your face</h3>
          <Button 
            onClick={closeCamera}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Camera View */}
        <div className="flex-1 relative overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">Loading camera...</p>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {cameraError && (
            <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
              <div className="text-center max-w-sm mx-auto p-6">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-white mb-4">{cameraError}</p>
                <Button 
                  onClick={closeCamera}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  Use Gallery Instead
                </Button>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Face Guide Overlay */}
          {!isLoading && !cameraError && (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Main face outline - simple and elegant */}
                  <div className="w-72 h-96 border border-white/40 rounded-full relative shadow-2xl">
                    {/* Subtle corner indicators */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 border-l border-t border-white/60 rounded-tl-md"></div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 border-r border-t border-white/60 rounded-tr-md"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l border-b border-white/60 rounded-bl-md"></div>
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r border-b border-white/60 rounded-br-md"></div>
                    
                    {/* Subtle center guide for eye alignment */}
                    <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30">
                      <div className="w-6 h-px bg-white"></div>
                      <div className="w-px h-6 bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                  
                  {/* Minimal instruction text */}
                  <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-white/80 text-sm font-light">Center your face within the guide</p>
                  </div>
                </div>
              </div>
              
              {/* Capture Button */}
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={takePicture}
                  className="w-20 h-20 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center group"
                >
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 group-hover:border-gray-300 transition-colors" />
                </button>
              </div>
              
              {/* Bottom gradient for better button visibility */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
            </>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera Error Alert */}
      {cameraError && (
        <Card className="bg-red-50 border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800 font-medium mb-1">Camera Issue</p>
              <p className="text-sm text-red-700">{cameraError}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Paste Hint */}
      {pasteHint && (
        <Card className="bg-green-50 border-green-200 rounded-2xl p-4 animate-in fade-in-0 duration-200">
          <div className="flex items-center gap-3">
            <Clipboard className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-800 font-medium">Ready to paste!</p>
              <p className="text-sm text-green-700">Paste an image from your clipboard</p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Upload Card */}
      <div className="space-y-3 md:bg-white md:rounded-2xl md:p-6 md:shadow-sm">
        <Button 
          onClick={handleUploadClick}
          className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-2xl text-lg shadow-sm active-scale"
        >
          <Upload className="w-5 h-5 mr-3" />
          Choose from Gallery
        </Button>

        <Button 
          onClick={handleCameraClick}
          disabled={isLoading}
          className="w-full h-14 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-2xl text-lg shadow-sm active-scale disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-3" />
              Loading...
            </>
          ) : (
            <>
              <Camera className="w-5 h-5 mr-3" />
              Use Camera
            </>
          )}
        </Button>

        {/* Paste Option */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200"/>
          </div>
          <div className="relative flex justify-center text-xs text-gray-500">
            <span className="bg-white px-2">or</span>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="text-center">
            <Clipboard className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">
              Press {isMac ? 'Cmd+V' : 'Ctrl+V'} to paste
            </p>
            <p className="text-xs text-gray-500">Copy an image and paste it here</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Privacy Note */}
      <div className="bg-blue-50 rounded-2xl p-4 border-0">
        <p className="text-sm text-blue-800 text-center">
          <span className="font-medium">Privacy Protected:</span> Photos are processed securely and never stored, whether uploaded, captured, or pasted
        </p>
      </div>
    </div>
  );
};

export default PhotoUpload;
