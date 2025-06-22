
import React from 'react';
import { Star, RotateCcw, Share2, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ResultsDisplayProps {
  uploadedImage: string;
  onReset: () => void;
}

// Dummy celebrity data
const celebrityMatches = [
  {
    name: "Emma Stone",
    percentage: 94,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80",
    description: "Academy Award Winner",
    confidence: "Very High"
  },
  {
    name: "Ryan Gosling",
    percentage: 87,
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=400&q=80",
    description: "Canadian Actor",
    confidence: "High"
  },
  {
    name: "Zendaya",
    percentage: 82,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80",
    description: "Actress & Singer",
    confidence: "High"
  }
];

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ uploadedImage, onReset }) => {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="text-center pt-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-2xl mb-4 animate-scale-in shadow-lg">
          <Trophy className="w-8 h-8 text-yellow-900" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Matches</h2>
        <p className="text-gray-600">Here are your top celebrity lookalikes</p>
      </div>

      {/* Your Photo */}
      <Card className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <img 
            src={uploadedImage} 
            alt="Your photo" 
            className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100"
          />
          <div>
            <p className="font-semibold text-gray-900">Your Photo</p>
            <p className="text-sm text-gray-500">Ready for analysis</p>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-3">
        {celebrityMatches.map((celebrity, index) => (
          <Card key={celebrity.name} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={celebrity.image} 
                  alt={celebrity.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100"
                />
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                    <Star className="w-3 h-3 text-yellow-900 fill-current" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{celebrity.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{celebrity.percentage}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{celebrity.description}</p>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-black h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{width: `${celebrity.percentage}%`}}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">Confidence: {celebrity.confidence}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 pt-6">
        <Button 
          className="w-full h-14 bg-black hover:bg-gray-800 text-white font-semibold rounded-2xl shadow-lg transition-all duration-200 active:scale-[0.98]"
        >
          <Share2 className="w-5 h-5 mr-3" />
          Share Results
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
        
        <Button 
          onClick={onReset}
          variant="outline"
          className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Another Photo
        </Button>
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-gray-400">
          Results are for entertainment purposes only
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;
