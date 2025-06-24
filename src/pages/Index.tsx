import React, { useState, useEffect } from 'react';
import PhotoUpload from '@/components/PhotoUpload';
import EnhancedResultsDisplay from '@/components/EnhancedResultsDisplay';
import ShareCard from '@/components/ShareCard';
import Header from '@/components/Header';
import FAQ from '@/components/FAQ';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { hc } from 'hono/client';
import type { AppType } from '../../server/hono';

type AppState = 'landing' | 'processing' | 'results' | 'error';

type Match = {
  name: string;
  percentage: number;
  image: string;
  description: string;
  confidence: string;
  category: string;
};

type AnalysisResult = {
  matches: Match[];
};

const client = hc<AppType>('http://localhost:3001/');

const Index = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [matchData, setMatchData] = useState<{ name: string; image: string; percentage: number } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const fetchMatches = async (imageFile: string): Promise<AnalysisResult> => {
    // Convert image to base64
    const base64Data = imageFile.split(',')[1]; // Remove data:image/jpeg;base64, prefix
    
    const res = await client.api.matches.$post({
      json: { imageBase64: base64Data }
    });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error occurred');
      throw new Error(errorText);
    }
    
    const data = await res.json();
    // The server now returns both analysis and matches
    return {
      matches: data.matches || []
    };
  };

  // Simulate progress during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (appState === 'processing') {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // Stop at 90% until actual completion
          return prev + Math.random() * 15 + 5; // Increment by 5-20%
        });
      }, 200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [appState]);

  const handleImageUpload = async (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setAppState('processing');
    setError(null);
    setProgress(0);
    setShowErrorDetails(false);
    
    try {
      // Fetch data during processing state
      const result = await fetchMatches(imageUrl);
      setProgress(100); // Complete the progress
      setTimeout(() => {
        setAnalysisResult(result);
        setAppState('results');
      }, 300); // Small delay to show 100% completion
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while analyzing your photo. Please try again.';
      setError(errorMessage);
      setAppState('error');
    }
  };

  const resetApp = () => {
    setUploadedImage(null);
    setShowShareCard(false);
    setMatchData(null);
    setAnalysisResult(null);
    setError(null);
    setProgress(0);
    setShowErrorDetails(false);
    setAppState('landing');
  };

  const handleShare = (data: { name: string; image: string; percentage: number }) => {
    setMatchData(data);
    setShowShareCard(true);
  };

  const handleShareClose = () => {
    setShowShareCard(false);
  };

  const getCleanErrorMessage = (rawError: string): string => {
    // Check for common error patterns and return user-friendly messages
    if (rawError.includes('max_payload size exceeded') || rawError.includes('payload')) {
      return 'Your image file is too large. Please try with a smaller image or compress it first.';
    }
    if (rawError.includes('AI Service Error') || rawError.includes('temporarily unavailable')) {
      return 'Our AI service is temporarily busy. Please try again in a few moments.';
    }
    if (rawError.includes('500') || rawError.includes('Internal')) {
      return 'We\'re experiencing technical difficulties. Please try again shortly.';
    }
    if (rawError.includes('timeout') || rawError.includes('Timeout')) {
      return 'The request took too long to process. Please check your connection and try again.';
    }
    if (rawError.includes('network') || rawError.includes('Network')) {
      return 'Network connection issue. Please check your internet and try again.';
    }
    
    // Default friendly message
    return 'Something went wrong while analyzing your photo. Please try again.';
  };

  // Error State
  if (appState === 'error') {
    const cleanError = error ? getCleanErrorMessage(error) : 'Something went wrong while analyzing your photo. Please try again.';
    
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1 px-6">
          {/* Preview of the uploaded image */}
          {uploadedImage && (
            <div className="relative mb-10">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-28 h-28 rounded-2xl object-cover shadow-sm opacity-50"
              />
            </div>
          )}

          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              {cleanError}
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={resetApp}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-2xl text-lg shadow-sm"
              >
                <RotateCcw className="w-5 h-5 mr-3" />
                Try Again
              </Button>
              
              {/* Technical Details Toggle */}
              <Button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                variant="ghost"
                className="w-full text-gray-500 hover:text-gray-700 text-sm"
              >
                {showErrorDetails ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide technical details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show technical details
                  </>
                )}
              </Button>
              
              {/* Technical Error Details */}
              {showErrorDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border-l-4 border-red-200">
                  <p className="text-xs text-gray-600 font-mono break-words leading-relaxed">
                    {error}
                  </p>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-4">
                Make sure you have a stable internet connection and try uploading a clear photo of your face.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Processing State
  if (appState === 'processing') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1 px-6">
          {/* Preview of the uploaded image with a gentle blur overlay */}
          {uploadedImage && (
            <div className="relative mb-10">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-28 h-28 rounded-2xl object-cover shadow-sm"
              />

              {/* Soft overlay & animated dots */}
              <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <div className="flex space-x-2">
                  <span className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }} />
                  <span className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }} />
                  <span className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Analyzing your photo…</h2>
          <p className="text-gray-600 text-center leading-relaxed max-w-sm mb-12">
            We're matching your features against thousands of celebrity profiles.
          </p>

          {/* Animated progress bar */}
          <div className="w-full max-w-xs mb-4">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gray-900 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              {Math.round(Math.min(progress, 100))}% complete
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Results State
  if (appState === 'results' && uploadedImage && analysisResult) {
    return (
      <>
        <EnhancedResultsDisplay 
          uploadedImage={uploadedImage} 
          matches={analysisResult.matches}
          onReset={resetApp}
          onShare={handleShare}
        />
        <ShareCard 
          userImage={uploadedImage}
          celebrityName={matchData?.name || "Ryan Gosling"}
          celebrityImage={matchData?.image || "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=400&q=80"}
          percentage={matchData?.percentage || 89}
          open={showShareCard}
          onOpenChange={setShowShareCard}
        />
      </>
    );
  }

  // Main Landing Page
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-md mx-auto">
        {/* Hero Section */}
        <div className="text-center pt-16 pb-12 px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8 shadow-sm overflow-hidden">
            <img 
              src="/lovable-uploads/d24d594a-33ec-4302-b4c9-8235382d96ff.png" 
              alt="LookalikeCeleb Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-3xl font-semibold text-gray-900 mb-4 leading-tight">
            Which Celebrity
            <br />
            Do You Look Like?
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed mb-12">
            Discover your celebrity twin with AI-powered facial recognition
          </p>

          {/* Photo Upload Section */}
          <PhotoUpload onImageUpload={handleImageUpload} />
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
};

export default Index;
