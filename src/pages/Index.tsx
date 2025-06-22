import React, { useState } from 'react';
import PhotoUpload from '@/components/PhotoUpload';
import EnhancedResultsDisplay from '@/components/EnhancedResultsDisplay';
import ShareCard from '@/components/ShareCard';
import Header from '@/components/Header';
import FAQ from '@/components/FAQ';
import { hc } from 'hono/client';
import type { AppType } from '../../server/hono';

type AppState = 'landing' | 'processing' | 'results';

type Match = {
  name: string;
  percentage: number;
  image: string;
  description: string;
  confidence: string;
  category: string;
};

const client = hc<AppType>('http://localhost:3001/');

const Index = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [matchData, setMatchData] = useState<{ name: string; image: string; percentage: number } | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  const fetchMatches = async (): Promise<Match[]> => {
    const res = await client.api.matches.$get();
    
    if (!res.ok) {
      throw new Error('Failed to fetch matches');
    }
    
    const data = await res.json();
    return data.matches;
  };

  const handleImageUpload = async (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setAppState('processing');
    
    try {
      // Fetch data during processing state
      const matchesData = await fetchMatches();
      setMatches(matchesData);
      setAppState('results');
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      // Could show error state here
    }
  };

  const resetApp = () => {
    setUploadedImage(null);
    setShowShareCard(false);
    setMatchData(null);
    setMatches([]);
    setAppState('landing');
  };

  const handleShare = (data: { name: string; image: string; percentage: number }) => {
    setMatchData(data);
    setShowShareCard(true);
  };

  const handleShareClose = () => {
    setShowShareCard(false);
  };

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

          {/* Subtle indeterminate progress bar */}
          <div className="w-full max-w-xs h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
            <span className="absolute left-0 top-0 h-full w-2/3 bg-gray-900 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Results State
  if (appState === 'results' && uploadedImage && matches.length > 0) {
    return (
      <>
        <EnhancedResultsDisplay 
          uploadedImage={uploadedImage} 
          matches={matches}
          onReset={resetApp}
          onShare={handleShare}
        />
        {showShareCard && (
          <ShareCard 
            userImage={uploadedImage}
            celebrityName={matchData?.name || "Ryan Gosling"}
            celebrityImage={matchData?.image || "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=400&q=80"}
            percentage={matchData?.percentage || 89}
            onClose={handleShareClose}
          />
        )}
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
              alt="CelebLook Logo" 
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
