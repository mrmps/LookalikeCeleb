
import React from 'react';
import { Star, RotateCcw, Share2, Trophy } from 'lucide-react';
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
    description: "Academy Award-winning actress"
  },
  {
    name: "Ryan Gosling",
    percentage: 87,
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=400&q=80",
    description: "Canadian actor and musician"
  },
  {
    name: "Zendaya",
    percentage: 82,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80",
    description: "Actress and singer"
  }
];

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ uploadedImage, onReset }) => {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 animate-scale-in">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Celebrity Matches!</h2>
        <p className="text-gray-600">Here are your top lookalikes</p>
      </div>

      {/* Your Photo */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="text-center">
          <img 
            src={uploadedImage} 
            alt="Your photo" 
            className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow-lg"
          />
          <p className="text-sm font-medium text-gray-700">Your Photo</p>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {celebrityMatches.map((celebrity, index) => (
          <Card key={celebrity.name} className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover-scale">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={celebrity.image} 
                  alt={celebrity.name}
                  className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md"
                />
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white fill-current" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800">{celebrity.name}</h3>
                  <span className="text-lg font-bold text-purple-600">{celebrity.percentage}%</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{celebrity.description}</p>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{width: `${celebrity.percentage}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Button 
          onClick={onReset}
          className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover-scale"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Try Another Photo
        </Button>
        
        <Button 
          variant="outline"
          className="w-full h-14 border-2 border-gray-200 hover:border-purple-300 text-gray-700 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200 hover-scale"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Results
        </Button>
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-gray-500">
          Results are for entertainment purposes only
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;
