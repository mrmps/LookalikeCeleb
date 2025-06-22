
import React, { useRef } from 'react';
import { Camera, Upload, Image, ArrowRight, CheckCircle } from 'lucide-react';
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
      <Card className="bg-white rounded-3xl p-8 lg:p-10 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Image className="w-8 h-8 lg:w-10 lg:h-10 text-gray-600" />
          </div>
          <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3">Upload Your Photo</h3>
          <p className="text-gray-600 leading-relaxed lg:text-lg">Take or choose a clear photo of your face for the most accurate results</p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleUploadClick}
            className="w-full h-14 lg:h-16 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-semibold rounded-2xl shadow-lg transition-all duration-200 active:scale-[0.98] lg:text-lg"
          >
            <Camera className="w-5 h-5 lg:w-6 lg:h-6 mr-3" />
            Take Photo
            <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 ml-auto" />
          </Button>

          <Button 
            onClick={handleUploadClick}
            variant="outline"
            className="w-full h-14 lg:h-16 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-200 active:scale-[0.98] lg:text-lg"
          >
            <Upload className="w-5 h-5 lg:w-6 lg:h-6 mr-3" />
            Choose from Gallery
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white px-4 text-gray-500 font-medium">or try a demo</span>
            </div>
          </div>

          <Button 
            onClick={handleDemoImage}
            variant="outline"
            className="w-full h-12 lg:h-14 border border-gray-200 text-gray-600 font-medium rounded-2xl hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
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

      {/* Enhanced Security Note */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-900 mb-2">Your Privacy is Protected</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Photos are processed securely and never stored</li>
              <li>• No personal data is collected or shared</li>
              <li>• Results are generated instantly and privately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
