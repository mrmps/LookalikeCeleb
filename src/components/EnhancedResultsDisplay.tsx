
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
    const timer = setTimeout(() => {
      setAnimatePercentages(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6 border-b border-gray-100">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Your Results</h1>
              <p className="text-sm text-gray-500">Celebrity Match Found!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        {/* Top Match Highlight - Fixed Interwoven Circles */}
        <Card className="bg-white p-8 shadow-sm border border-gray-100 rounded-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-6">
              <Crown className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">Best Match</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{topMatch.name}</h2>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
              {topMatch.category}
            </Badge>
          </div>

          {/* Properly Interwoven Circles Design */}
          <div className="relative flex items-center justify-center mb-8 h-72">
            {/* Left circle (Your photo) */}
            <div className="relative z-10">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                <img 
                  src={uploadedImage} 
                  alt="Your photo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-md border border-gray-200">
                <p className="text-xs font-medium text-gray-700">You</p>
              </div>
            </div>
            
            {/* Right circle (Celebrity photo) - overlapping */}
            <div className="relative z-10 -ml-16">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                <img 
                  src={topMatch.image} 
                  alt={topMatch.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-md border border-gray-200">
                <p className="text-xs font-medium text-gray-700">{topMatch.name}</p>
              </div>
            </div>

            {/* Match percentage in center overlap */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-gray-100">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {animatePercentages ? topMatch.percentage : 0}%
                </div>
                <p className="text-xs text-gray-500 font-medium -mt-1">Match</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={onShare}
            className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12 rounded-xl font-medium"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Your Match
          </Button>
        </Card>

        {/* All Matches */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Your Matches
          </h3>
          
          {celebrityMatches.map((celebrity, index) => (
            <Card key={celebrity.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img 
                    src={celebrity.image} 
                    alt={celebrity.name}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                  />
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-yellow-900 fill-current" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{celebrity.name}</h4>
                    <span className="text-xl font-bold text-gray-900">
                      {animatePercentages ? celebrity.percentage : 0}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{celebrity.description}</p>
                  
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-gray-900 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: animatePercentages ? `${celebrity.percentage}%` : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Global Stats */}
        <Card className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Your Ranking</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">Top 15%</div>
              <p className="text-sm text-gray-500">Global Ranking</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">4.2M</div>
              <p className="text-sm text-gray-500">Total Matches</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            onClick={onReset}
            variant="outline"
            className="w-full h-12 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Another Photo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedResultsDisplay;
