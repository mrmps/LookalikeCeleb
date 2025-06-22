
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Your Results</h1>
              <p className="text-sm text-gray-500">Celebrity Match Found!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        {/* Top Match Highlight */}
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 text-white shadow-xl rounded-3xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-2 mb-4">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Best Match</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{topMatch.name}</h2>
            <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-0">
              {topMatch.category}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <img 
              src={uploadedImage} 
              alt="Your photo" 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white"
            />
            <div className="flex-1 text-center">
              <div className="text-4xl font-bold mb-1">
                {animatePercentages ? topMatch.percentage : 0}%
              </div>
              <p className="text-sm opacity-90">Match Score</p>
            </div>
            <img 
              src={topMatch.image} 
              alt={topMatch.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white"
            />
          </div>

          <Button 
            onClick={onShare}
            className="w-full bg-white text-gray-900 hover:bg-gray-100 h-12 rounded-2xl font-semibold"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Your Match
          </Button>
        </Card>

        {/* All Matches */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Your Matches
          </h3>
          
          {celebrityMatches.map((celebrity, index) => (
            <Card key={celebrity.name} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={celebrity.image} 
                    alt={celebrity.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-yellow-900 fill-current" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{celebrity.name}</h4>
                    <span className="text-xl font-bold text-gray-900">
                      {animatePercentages ? celebrity.percentage : 0}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{celebrity.description}</p>
                  
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 ease-out"
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
        <Card className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
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
            className="w-full h-14 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50"
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
