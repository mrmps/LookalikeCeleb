
import React, { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
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
  const handleTakePhoto = () => {
    onImageUpload("https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80");
  };

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
            onClick={handleTakePhoto}
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
          capture="user"
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
