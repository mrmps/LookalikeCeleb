
import React, { useState } from 'react';
import { Camera, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CameraPermissionProps {
  onAllow: () => void;
  onDeny: () => void;
}

const CameraPermission: React.FC<CameraPermissionProps> = ({ onAllow, onDeny }) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAllowCamera = async () => {
    setIsRequesting(true);
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      onAllow();
    } catch (error) {
      console.log('Camera permission denied');
      onDeny();
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 text-center bg-white shadow-lg">
        <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Camera className="w-10 h-10 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Camera Access Required
        </h2>
        
        <p className="text-gray-600 leading-relaxed mb-8">
          We need access to your camera to take a photo for celebrity matching. 
          Your privacy is protected - photos are processed securely and never stored.
        </p>

        <div className="bg-green-50 rounded-2xl p-4 mb-8 border border-green-100">
          <div className="flex items-center justify-center gap-2 text-green-800">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">100% Private & Secure</span>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleAllowCamera}
            disabled={isRequesting}
            className="w-full h-14 bg-black hover:bg-gray-800 text-white font-semibold rounded-2xl transition-all duration-200"
          >
            {isRequesting ? "Requesting Access..." : "Allow Camera Access"}
          </Button>
          
          <Button 
            onClick={onDeny}
            variant="outline"
            className="w-full h-12 border-2 border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50"
          >
            Not Now
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CameraPermission;
