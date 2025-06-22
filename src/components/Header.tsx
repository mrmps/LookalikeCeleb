
import React from 'react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center justify-center py-4 px-6 max-w-sm mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl overflow-hidden">
            <img 
              src="/lovable-uploads/d24d594a-33ec-4302-b4c9-8235382d96ff.png" 
              alt="CelebLook Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-semibold text-gray-900">
            CelebLook
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
