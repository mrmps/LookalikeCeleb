
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Header />
      
      <div className="px-4 pb-8">
        {!uploadedImage ? (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-8 pt-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 animate-scale-in">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Celebrity Lookalike
              </h1>
              <p className="text-gray-600 text-lg px-4">
                Discover which celebrity you look like most!
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card className="p-4 text-center bg-white/80 backdrop-blur-sm border-0 shadow-sm hover-scale">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Take Photo</h3>
                <p className="text-sm text-gray-600">Use your camera for instant analysis</p>
              </Card>
              
              <Card className="p-4 text-center bg-white/80 backdrop-blur-sm border-0 shadow-sm hover-scale">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Upload Photo</h3>
                <p className="text-sm text-gray-600">Choose from your gallery</p>
              </Card>
              
              <Card className="p-4 text-center bg-white/80 backdrop-blur-sm border-0 shadow-sm hover-scale">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Get Results</h3>
                <p className="text-sm text-gray-600">See your celebrity matches</p>
              </Card>
            </div>

            <PhotoUpload onImageUpload={handleImageUpload} />
          </div>
        ) : !showResults ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing your photo...</h2>
            <p className="text-gray-600 text-center px-4">
              Our AI is finding your celebrity matches
            </p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mt-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
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
