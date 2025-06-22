import React, { useState, useEffect } from 'react';
import { Star, Share2, RotateCcw, Trophy, Crown, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EnhancedResultsDisplayProps {
  uploadedImage: string;
  onReset: () => void;
  onShare: () => void;
}

const celebrityMatches = [
  {
    name: "Ryan Gosling",
    percentage: 89,
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=400&q=80",
    description: "Canadian Actor",
    confidence: "Very High",
    category: "Hollywood Star"
  },
  {
    name: "Chris Evans",
    percentage: 84,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80",
    description: "Marvel Superhero",
    confidence: "High",
    category: "Action Star"
  },
  {
    name: "Michael B. Jordan",
    percentage: 78,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80",
    description: "Award-winning Actor", 
    confidence: "High",
    category: "Rising Star"
  }
];

const EnhancedResultsDisplay: React.FC<EnhancedResultsDisplayProps> = ({ 
  uploadedImage, 
  onReset, 
  onShare 
}) => {
  const [animatePercentages, setAnimatePercentages] = useState(false);
  const topMatch = celebrityMatches[0];

  useEffect(() => {
    const timer = setTimeout(() => setAnimatePercentages(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-6 py-5">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Your Celebrity Match</h1>
                <p className="text-sm text-gray-500">Analysis Complete</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Best Match Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
            <Crown className="w-4 h-4 text-amber-700" />
            <span className="text-sm font-medium text-amber-800">Best Match</span>
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
              <img 
                src={topMatch.image} 
                alt={topMatch.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="p-3">
                  <p className="text-white text-sm font-medium">{topMatch.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Native Match Display */}
        <div className="text-center space-y-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{topMatch.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{topMatch.category}</p>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-green-50 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-semibold text-green-800">
              {animatePercentages ? topMatch.percentage : 0}% Match
            </span>
          </div>
        </div>
        
        {/* Native Action Button */}
        <div className="pt-2">
          <Button 
            onClick={onShare}
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
          </div>
          
          <div className="space-y-3">
            {celebrityMatches.map((celebrity, index) => (
              <Card 
                key={celebrity.name} 
                className={`bg-white border border-gray-200 rounded-xl ${
                  index === 0 ? 'ring-2 ring-gray-900' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Celebrity Image */}
                    <div className="relative">
                      <img 
                        src={celebrity.image} 
                        alt={celebrity.name}
                        className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                      />
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                          <Star className="w-2.5 h-2.5 text-white fill-current" />
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
                      
                      <p className="text-sm text-gray-500 mb-2">{celebrity.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${
                            index === 0 ? 'bg-gray-900' : 'bg-gray-400'
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

        {/* Stats Card */}
        <Card className="bg-white border border-gray-200 rounded-xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Your Ranking</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">Top 15%</div>
                <p className="text-sm text-gray-500">Global Ranking</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">4.2M</div>
                <p className="text-sm text-gray-500">Total Matches</p>
              </div>
            </div>
          </div>
        </Card>

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

