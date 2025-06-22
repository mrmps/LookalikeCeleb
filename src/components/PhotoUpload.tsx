
import React, { useRef } from 'react';
import { Camera, Upload, Image, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PhotoUploadProps {
  onImageUpload: (imageUrl: string) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // For demo purposes, we'll use placeholder images
  const handleDemoImage = () => {
    onImageUpload("https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80");
  };

  return (
    <div className="space-y-6 upload-section">
      {/* Main Upload Card */}
      <Card className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Image className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Your Photo</h3>
          <p className="text-gray-600 leading-relaxed">Take or choose a clear photo of your face</p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleUploadClick}
            className="w-full h-14 bg-black hover:bg-gray-800 text-white font-semibold rounded-2xl transition-all duration-200"
          >
            <Camera className="w-5 h-5 mr-3" />
            Take Photo
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>

          <Button 
            onClick={handleUploadClick}
            variant="outline"
            className="w-full h-14 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-200"
          >
            <Upload className="w-5 h-5 mr-3" />
            Choose from Gallery
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">or try a demo</span>
            </div>
          </div>

          <Button 
            onClick={handleDemoImage}
            variant="outline"
            className="w-full h-12 border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all duration-200"
          >
            Use Demo Photo
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          capture="user"
        />
      </Card>

      {/* Privacy Note */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <p className="text-sm text-blue-800 text-center">
          <span className="font-medium">Privacy Protected:</span> Photos are processed securely and never stored
        </p>
      </div>
    </div>
  );
};

export default PhotoUpload;
