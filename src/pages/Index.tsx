
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
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
      
      <div className="px-6 pb-8 max-w-md mx-auto">
        {!uploadedImage ? (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="text-center pt-16 pb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-8 animate-scale-in">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                Which Celebrity
                <br />
                Do You Look Like?
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-12">
                Discover your celebrity twin with AI-powered facial recognition
              </p>
            </div>

            {/* Upload Section */}
            <PhotoUpload onImageUpload={handleImageUpload} />
          </div>
        ) : !showResults ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center mb-8 animate-pulse">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Analyzing Your Photo</h2>
            <p className="text-gray-600 text-center leading-relaxed mb-8">
              Our AI is finding your celebrity matches...
            </p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-black h-2 rounded-full animate-pulse transition-all duration-1000" style={{width: '75%'}}></div>
            </div>
            <p className="text-sm text-gray-500">This usually takes 2-3 seconds...</p>
          </div>
        ) : (
          <ResultsDisplay uploadedImage={uploadedImage} onReset={resetApp} />
        )}
      </div>
    </div>
  );
};

export default Index;
