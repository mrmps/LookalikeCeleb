
import React, { useRef } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ShareCardProps {
  userImage: string;
  celebrityName: string;
  celebrityImage: string;
  percentage: number;
  onClose: () => void;
}

const ShareCard: React.FC<ShareCardProps> = ({
  userImage,
  celebrityName,
  celebrityImage,
  percentage,
  onClose
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (cardRef.current) {
      // In a real app, you'd use html2canvas or similar library
      console.log('Download functionality would be implemented here');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I look ${percentage}% like ${celebrityName}!`,
          text: `Check out my celebrity match on CelebLook!`,
          url: window.location.origin
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Share Your Match</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Shareable Card */}
        <Card 
          ref={cardRef}
          className="bg-gray-900 p-6 text-white mb-6 rounded-xl border-0"
        >
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-1">CelebLook Match</h3>
            <p className="text-sm opacity-90">AI-Powered Celebrity Recognition</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <img 
                src={userImage} 
                alt="You" 
                className="w-16 h-16 rounded-xl object-cover border-2 border-white mb-2 mx-auto"
              />
              <p className="text-xs opacity-90">You</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{percentage}%</div>
              <p className="text-xs opacity-90">Match</p>
            </div>
            
            <div className="text-center">
              <img 
                src={celebrityImage} 
                alt={celebrityName}
                className="w-16 h-16 rounded-xl object-cover border-2 border-white mb-2 mx-auto"
              />
              <p className="text-xs opacity-90">{celebrityName}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm opacity-90">Find your celebrity twin at</p>
            <p className="font-semibold">CelebLook.app</p>
          </div>
        </Card>

        {/* Share Options */}
        <div className="space-y-3">
          <Button 
            onClick={handleShare}
            className="w-full h-12 bg-gray-900 text-white rounded-xl hover:bg-gray-800"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Result
          </Button>
          
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="w-full h-12 rounded-xl border border-gray-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Image
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareCard;
