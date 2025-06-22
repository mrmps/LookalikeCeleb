
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
    <div className="space-y-6">
      {/* Main Upload Card */}
      <Card className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Photo</h3>
          <p className="text-gray-600 leading-relaxed">Take or choose a clear photo of your face for best results</p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleUploadClick}
            className="w-full h-14 bg-black hover:bg-gray-800 text-white font-semibold rounded-2xl shadow-lg transition-all duration-200 active:scale-[0.98]"
          >
            <Camera className="w-5 h-5 mr-3" />
            Take Photo
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>

          <Button 
            onClick={handleUploadClick}
            variant="outline"
            className="w-full h-14 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
          >
            <Upload className="w-5 h-5 mr-3" />
            Choose from Gallery
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          <Button 
            onClick={handleDemoImage}
            variant="outline"
            className="w-full h-12 border border-gray-200 text-gray-600 font-medium rounded-2xl hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
          >
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

      {/* Security Note */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">Privacy Protected</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Your photos are processed securely and never stored on our servers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
