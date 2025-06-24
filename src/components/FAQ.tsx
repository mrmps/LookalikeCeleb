
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      question: "How accurate is the celebrity matching?",
      answer: "Our AI uses advanced facial recognition technology to analyze key facial features and compare them with thousands of celebrity profiles. While results are for entertainment purposes, our algorithm achieves high accuracy in identifying similar facial structures and features."
    },
    {
      question: "Is my photo stored or shared?",
      answer: "No, your privacy is our priority. Photos are processed securely and are never stored on our servers or shared with third parties. All analysis happens in real-time and your images are deleted immediately after processing."
    },
    {
      question: "What makes a good photo for matching?",
      answer: "For best results, use a clear, well-lit photo where your face is clearly visible and facing forward. Avoid sunglasses, heavy makeup, or filters that might obscure your natural features."
    },
    {
      question: "Can I use any photo format?",
      answer: "Yes, LookalikeCeleb supports all common image formats including JPG and PNG. More niche types like WEBP are NOT supported.You can upload photos from your gallery or take a new photo directly through the app."
    },
    {
      question: "How long does the analysis take?",
      answer: "The celebrity matching process typically takes 2-3 seconds. Our AI quickly analyzes your facial features and compares them against our extensive celebrity database to find your best matches."
    },
    {
      question: "Can I share my results?",
      answer: "Absolutely! Once you get your celebrity match, you can easily share your results on social media or save them to your device. We provide beautifully designed share cards for your results."
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600">
          Everything you need to know about LookalikeCeleb
        </p>
      </div>

      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <Card key={index} className="bg-white border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 pr-4">
                {item.question}
              </span>
              <ChevronDown 
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                  openItems.includes(index) ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openItems.includes(index) && (
              <div className="px-6 pb-5">
                <p className="text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
