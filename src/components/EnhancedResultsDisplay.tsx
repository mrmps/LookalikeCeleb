import React, { useState, useEffect } from 'react';
import { Star, Share2, RotateCcw, Crown, Users, TrendingUp, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import { ensureSafeImage } from '@/lib/utils';
import { SafeImg } from '@/components/ui/SafeImg';

interface EnhancedResultsDisplayProps {
  uploadedImage: string;
  matches: Match[];
  onReset: () => void;
  onShare: (matchData: { name: string; image: string; percentage: number }) => void;
}

type Match = {
  name: string;
  percentage: number;
  image: string;
  description: string;
  confidence: string;
  category: string;
};

const EnhancedResultsDisplay: React.FC<EnhancedResultsDisplayProps> = ({ 
  uploadedImage,
  matches,
  onReset, 
  onShare 
}) => {
  const [animatePercentages, setAnimatePercentages] = useState(false);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);
  const selectedMatch = matches[selectedMatchIndex];

  useEffect(() => {
    // Start animation immediately since data is already available
    setTimeout(() => setAnimatePercentages(true), 100);
  }, []);

  const handleSelectMatch = (index: number) => {
    setSelectedMatchIndex(index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
          <Card className="bg-blue-50 border border-blue-200 rounded-xl">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Photo Analysis</h3>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">
                {selectedMatch.description}
              </p>
            </div>
          </Card>

        {/* Selected Match Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
            <Crown className="w-4 h-4 text-amber-700" />
            <span className="text-sm font-medium text-amber-800">
              {selectedMatchIndex === 0 ? 'Best Match' : 'Selected Match'}
            </span>
          </div>
        </div>

        {/* Native Comparison Container */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="flex h-80">
            {/* Your Photo - Left Side */}
            <div className="flex-1 relative bg-gray-100">
              <img 
                src={uploadedImage} 
                alt="Your photo" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="p-3">
                  <p className="text-white text-sm font-medium">You</p>
                </div>
              </div>
            </div>
            
            {/* Native Separator */}
            <div className="relative flex-shrink-0 flex items-stretch pointer-events-none z-20">
              {/* Subtle translucent line */}
              <div className="w-[2px] bg-white/70 backdrop-blur-sm" />
              {/* VS pill */}
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 text-gray-900 text-[10px] font-semibold leading-none px-2 py-0.5 rounded-full shadow-sm select-none">
                VS
              </span>
            </div>
            
            {/* Celebrity Photo - Right Side */}
            <div className="flex-1 relative bg-gray-100">
              <SafeImg 
                src={selectedMatch.image} 
                alt={selectedMatch.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="p-3">
                  <p className="text-white text-sm font-medium">{selectedMatch.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Native Match Display */}
        <div className="text-center space-y-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedMatch.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{selectedMatch.category}</p>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-green-50 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-semibold text-green-800">
              {animatePercentages ? selectedMatch.percentage : 0}% Match
            </span>
          </div>
        </div>
        
        {/* Native Action Button */}
        <div className="pt-2">
          <Button 
            onClick={async () => {
              const base64Image = await ensureSafeImage(selectedMatch.image);
              onShare({ name: selectedMatch.name, image: base64Image, percentage: selectedMatch.percentage });
            }}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-2xl font-medium shadow-sm active:scale-[0.98] transition-all"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Your Match
          </Button>
        </div>

        {/* All Matches Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">All Your Matches</h3>
            <span className="text-sm text-gray-500">Tap to compare</span>
          </div>
          
          <div className="space-y-3">
            {matches.map((celebrity, index) => (
              <Card 
                key={celebrity.name} 
                className={`bg-white border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  index === selectedMatchIndex 
                    ? 'border-gray-900 ring-2 ring-gray-900/20' 
                    : index === 0 
                      ? 'border-amber-200' 
                      : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectMatch(index)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Celebrity Image */}
                    <div className="relative">
                      <SafeImg 
                        src={celebrity.image} 
                        alt={celebrity.name}
                        className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                      />
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                          <Star className="w-2.5 h-2.5 text-white fill-current" />
                        </div>
                      )}
                      {index === selectedMatchIndex && (
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Celebrity Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{celebrity.name}</h4>
                        <span className="text-lg font-bold text-gray-900">
                          {animatePercentages ? celebrity.percentage : 0}%
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 leading-relaxed">{celebrity.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${
                            index === selectedMatchIndex ? 'bg-gray-900' : 
                            index === 0 ? 'bg-amber-400' : 'bg-gray-400'
                          }`}
                          style={{
                            width: animatePercentages ? `${celebrity.percentage}%` : '0%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            onClick={onReset}
            variant="outline"
            className="w-full h-12 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Another Photo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedResultsDisplay;

