
import React, { useRef } from 'react';
import { Camera, Upload, Image } from 'lucide-react';
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
    // Using a placeholder image
    onImageUpload("https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80");
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose Your Photo</h3>
          <p className="text-gray-600">Upload a clear photo of your face for the best results</p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleUploadClick}
            className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover-scale"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload from Gallery
          </Button>

          <Button 
            onClick={handleDemoImage}
            variant="outline"
            className="w-full h-14 border-2 border-gray-200 hover:border-purple-300 text-gray-700 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200 hover-scale"
          >
            <Camera className="w-5 h-5 mr-2" />
            Try Demo Photo
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

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Your photo is processed securely and never stored
        </p>
      </div>
    </div>
  );
};

export default PhotoUpload;
