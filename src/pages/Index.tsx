
import React, { useState } from 'react';
import { Camera, Upload, Sparkles, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PhotoUpload from '@/components/PhotoUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import Header from '@/components/Header';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    // Simulate processing delay
    setTimeout(() => {
      setShowResults(true);
    }, 2000);
  };

  const resetApp = () => {
    setUploadedImage(null);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-6 pb-8 max-w-sm mx-auto">
        {!uploadedImage ? (
          <div className="animate-fade-in space-y-8">
            {/* Hero Section */}
            <div className="text-center pt-8 pb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-3xl mb-6 animate-scale-in shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                Celebrity Lookalike
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Discover which celebrity you look like most with AI
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">1M+</div>
                <div className="text-sm text-gray-500 mt-1">Photos</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">99%</div>
                <div className="text-sm text-gray-500 mt-1">Accuracy</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">5K+</div>
                <div className="text-sm text-gray-500 mt-1">Celebs</div>
              </div>
            </div>

            <PhotoUpload onImageUpload={handleImageUpload} />
          </div>
        ) : !showResults ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-8 animate-pulse shadow-xl">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Analyzing your photo</h2>
            <p className="text-gray-600 text-center leading-relaxed mb-8">
              Our AI is finding your celebrity matches
            </p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-1">
              <div className="bg-black h-1 rounded-full animate-pulse transition-all duration-1000" style={{width: '75%'}}></div>
            </div>
          </div>
        ) : (
          <ResultsDisplay uploadedImage={uploadedImage} onReset={resetApp} />
        )}
      </div>
    </div>
  );
};

export default Index;
