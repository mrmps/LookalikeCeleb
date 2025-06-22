
import React, { useState } from 'react';
import { Camera, Upload, Sparkles, Star, ArrowRight, Shield, Zap, Users, Eye, CheckCircle, Trophy, Heart, Smile } from 'lucide-react';
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

  const features = [
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get your celebrity matches in seconds with our lightning-fast AI"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your photos are processed securely and never stored on our servers"
    },
    {
      icon: Eye,
      title: "99.9% Accuracy",
      description: "Advanced facial recognition technology for precise celebrity matching"
    },
    {
      icon: Users,
      title: "5,000+ Celebrities",
      description: "Match with actors, musicians, athletes, and influencers worldwide"
    }
  ];

  const testimonials = [
    {
      text: "I can't believe how accurate this is! It matched me with Emma Stone and now all my friends are calling me her twin 😂",
      author: "Sarah M.",
      rating: 5
    },
    {
      text: "This app is addictive! I've uploaded like 20 photos and keep getting different celebrity matches. So fun!",
      author: "Jake T.",
      rating: 5
    },
    {
      text: "Finally found out why people always say I look familiar. Apparently I'm Ryan Gosling's doppelganger!",
      author: "Mike R.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-6 pb-8 max-w-md mx-auto lg:max-w-6xl">
        {!uploadedImage ? (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="text-center pt-12 pb-8 lg:pt-20 lg:pb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 lg:w-28 lg:h-28 bg-gradient-to-br from-black to-gray-800 rounded-3xl mb-8 animate-scale-in shadow-2xl">
                <Sparkles className="w-10 h-10 lg:w-14 lg:h-14 text-white" />
              </div>
              
              <h1 className="text-4xl lg:text-7xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight tracking-tight">
                Which Celebrity
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Do You Look Like?
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-8 lg:mb-12 max-w-2xl mx-auto">
                Discover your celebrity twin with our AI-powered facial recognition technology. 
                <span className="block mt-2 font-medium text-gray-900">
                  Used by over 1 million people worldwide!
                </span>
              </p>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 mb-12 lg:mb-16">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>100% Private</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Trophy className="w-4 h-4 text-purple-600" />
                  <span>99.9% Accurate</span>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 lg:gap-8 mb-12 lg:mb-16">
              <div className="bg-white rounded-3xl p-6 lg:p-8 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl lg:text-5xl font-bold text-gray-900 mb-2">1M+</div>
                <div className="text-sm lg:text-base text-gray-600">Photos Analyzed</div>
                <div className="mt-2">
                  <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 mx-auto" />
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 lg:p-8 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl lg:text-5xl font-bold text-gray-900 mb-2">99.9%</div>
                <div className="text-sm lg:text-base text-gray-600">Accuracy Rate</div>
                <div className="mt-2">
                  <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500 mx-auto" />
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 lg:p-8 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl lg:text-5xl font-bold text-gray-900 mb-2">5K+</div>
                <div className="text-sm lg:text-base text-gray-600">Celebrities</div>
                <div className="mt-2">
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500 mx-auto" />
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <PhotoUpload onImageUpload={handleImageUpload} />

            {/* Features Section */}
            <div className="mt-16 lg:mt-24">
              <h2 className="text-2xl lg:text-4xl font-bold text-center text-gray-900 mb-4 lg:mb-6">
                Why People Love CelebLook
              </h2>
              <p className="text-center text-gray-600 mb-12 lg:mb-16 max-w-2xl mx-auto">
                Join millions of users who've discovered their celebrity doppelgangers
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-16 lg:mb-24">
                {features.map((feature, index) => (
                  <Card key={index} className="p-6 lg:p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Testimonials Section */}
            <div className="mt-16 lg:mt-24">
              <h2 className="text-2xl lg:text-4xl font-bold text-center text-gray-900 mb-4 lg:mb-6">
                What People Are Saying
              </h2>
              <p className="text-center text-gray-600 mb-12 lg:mb-16">
                Real reactions from real users
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-24">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="p-6 lg:p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Smile className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">{testimonial.author}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Final CTA Section */}
            <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 rounded-3xl p-8 lg:p-12 text-center text-white mb-8">
              <h2 className="text-2xl lg:text-4xl font-bold mb-4">
                Ready to Find Your Celebrity Twin?
              </h2>
              <p className="text-gray-300 mb-8 lg:text-xl">
                Join over 1 million users who've discovered their look-alike
              </p>
              <Button 
                onClick={() => document.querySelector('.upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-200 active:scale-[0.98]"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-xs text-gray-400 mt-4">
                No registration required • Results in seconds
              </p>
            </div>
          </div>
        ) : !showResults ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-xl">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Analyzing Your Photo</h2>
            <p className="text-gray-600 text-center leading-relaxed mb-8 lg:text-lg">
              Our AI is scanning through thousands of celebrity faces to find your perfect match
            </p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse transition-all duration-1000" style={{width: '75%'}}></div>
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
