
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
      <Card className="w-full max-w-md p-8 text-center bg-white shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Camera className="w-10 h-10 text-gray-700" />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Camera Access Required
        </h2>
        
        <p className="text-gray-600 leading-relaxed mb-8">
          We need access to your camera to take a photo for celebrity matching. 
          Your privacy is protected - photos are processed securely and never stored.
        </p>

        <div className="bg-green-50 rounded-xl p-4 mb-8 border border-green-100">
          <div className="flex items-center justify-center gap-2 text-green-800">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">100% Private & Secure</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleAllowCamera}
            disabled={isRequesting}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl"
          >
            {isRequesting ? "Requesting Access..." : "Allow Camera Access"}
          </Button>
          
          <Button 
            onClick={onDeny}
            variant="outline"
            className="w-full h-11 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
          >
            Not Now
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CameraPermission;
