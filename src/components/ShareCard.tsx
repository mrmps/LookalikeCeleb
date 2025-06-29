// ShareCard.tsx
import React, {
  useRef, useState, useMemo, useCallback, memo, useEffect,
} from 'react';
import {
  Download, Copy, Check, Instagram, Facebook, Twitter,
  Linkedin, Sparkles, Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader } from '@/components/ui/drawer';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import * as htmlToImage from 'html-to-image';           // <–– NEW (handles CORS, font embedding, @2x etc.)
import { cn, ensureSafeImage } from '@/lib/utils';

/*–––––––––––––––––––––––––  CONSTANTS  –––––––––––––––––––––––*/

const providers = {
  instagram: {
    label: 'Instagram', icon: <Instagram className="w-4 h-4" />,
    ratio: '1/1', w: 1080, h: 1080, btn: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
  },
  facebook: {
    label: 'Facebook', icon: <Facebook className="w-4 h-4" />,
    ratio: '1/1', w: 1080, h: 1080, btn: 'bg-[#1877F2]',
  },
  twitter: {
    label: 'X (Twitter)', icon: <Twitter className="w-4 h-4" />,
    ratio: '1/1', w: 1080, h: 1080, btn: 'bg-black',
  },
  linkedin: {
    label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />,
    ratio: '4/5', w: 1080, h: 1350, btn: 'bg-[#0A66C2]',
  },
  snapchat: {
    label: 'Snapchat', icon: <span className="text-lg">👻</span>,
    ratio: '9/16', w: 1080, h: 1920, btn: 'bg-[#FFFC00] text-black',
  },
  tiktok: {
    label: 'TikTok', icon: <span className="font-bold">T</span>,
    ratio: '9/16', w: 1080, h: 1920, btn: 'bg-gradient-to-br from-black via-red-500 to-blue-500',
  },
  pinterest: {
    label: 'Pinterest', icon: <span className="font-bold">P</span>,
    ratio: '2/3', w: 1000, h: 1500, btn: 'bg-[#E60023]',
  },
} as const;

type ProviderKey = keyof typeof providers;

export interface ShareCardProps {
  userImage: string;
  celebrityName: string;
  celebrityImage: string;
  percentage: number;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

/*–––––––––––––––––––––––––  COMPONENT  –––––––––––––––––––––––*/

const ShareCard = ({
  userImage, celebrityName, celebrityImage, percentage,
  open, onOpenChange,
}: ShareCardProps) => {
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement>(null);

  /* state */
  const [providerKey, setProviderKey] = useState<ProviderKey>('instagram');
  const [userName, setUserName] = useState('Me');
  const [celebName, setCelebName] = useState(celebrityName);

  const [copied, setCopied] = useState(false);
  const [sharesCopied, setSharesCopied] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Update celebrity name when prop changes
  useEffect(() => {
    setCelebName(celebrityName);
  }, [celebrityName]);

  const provider = providers[providerKey];

  /*–––––––––––––  HELPERS  –––––––––––––*/

  const shareText = `You and ${celebName}? ${percentage}% twin!`;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const cardClass = useMemo(() => (
    provider.ratio === '9/16' ? 'aspect-[9/16] w-full max-w-xs'
      : provider.ratio === '2/3' ? 'aspect-[2/3] w-full max-w-sm'
      : provider.ratio === '4/5' ? 'aspect-[4/5] w-full max-w-sm'
      : 'aspect-square w-full max-w-sm'
  ), [provider.ratio]);

  const imgSize = useMemo(() => (
    provider.ratio === '9/16' ? 'w-32 h-32'
      : provider.ratio === '2/3' || provider.ratio === '4/5' ? 'w-40 h-40'
      : 'w-36 h-36'
  ), [provider.ratio]);

  const textSize = useMemo(() => (
    provider.ratio === '9/16' ? 'text-sm'
      : provider.ratio === '2/3' || provider.ratio === '4/5' ? 'text-base'
      : 'text-xs'
  ), [provider.ratio]);

  const percentageSize = useMemo(() => (
    provider.ratio === '9/16' ? 'text-xl'
      : provider.ratio === '2/3' || provider.ratio === '4/5' ? 'text-2xl'
      : 'text-lg'
  ), [provider.ratio]);

  /*–––––––––  ACTIONS  –––––––––*/

  /* 1 ▸ download / copy (html-to-image handles CORS & fonts, keeps exact pixels) */
  const makeImage = useCallback(async () => {
    if (!cardRef.current) return undefined;
    
    const element = cardRef.current;
    
    try {
      // Convert images to safe base64 format just before capture
      let safeUserImage = userImage;
      let safeCelebrityImage = celebrityImage;
      
      try {
        setIsConverting(true);
        console.log('Converting images to safe format for mobile export...');
        [safeUserImage, safeCelebrityImage] = await Promise.all([
          ensureSafeImage(userImage),
          ensureSafeImage(celebrityImage)
        ]);
      } catch (error) {
        console.warn('Image conversion failed, using original images:', error);
        // Continue with original images (may fail on mobile but work on desktop)
      } finally {
        setIsConverting(false);
      }
      
      // Wait for all images to load
      const images = element.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => {
            console.warn('Image failed to load:', img.src);
            resolve(); // Continue even if image fails
          };
          // Timeout after 5 seconds for base64 images (they can be large)
          setTimeout(() => resolve(), 5000);
        });
      }));
      
      // Additional delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Temporarily remove border for capture
      const originalBorder = element.style.border;
      element.style.border = 'none';
      
      // Get the exact bounds of the card element
      const rect = element.getBoundingClientRect();
      
      // First capture at natural size with exact bounds
      const naturalDataUrl = await htmlToImage.toPng(element, {
        
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: rect.width,
        height: rect.height,
        style: {
          margin: '0',
          transform: 'translate(0, 0)',
        }
      });
      
      // Restore original border
      element.style.border = originalBorder;
      
      // Then scale to target dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = provider.w;
      canvas.height = provider.h;
      
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = naturalDataUrl;
      });
      
      // Calculate scaling to fit while maintaining aspect ratio
      const scale = Math.min(provider.w / img.width, provider.h / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Center the image
      const x = (provider.w - scaledWidth) / 2;
      const y = (provider.h - scaledHeight) / 2;
      
      // Fill background
      ctx!.fillStyle = '#ffffff';
      ctx!.fillRect(0, 0, provider.w, provider.h);
      
      // Draw scaled image
      ctx!.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      const dataUrl = canvas.toDataURL('image/png');
      
      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error('Generated image is empty - this usually indicates a CORS/security issue on mobile browsers');
      }
      
      return dataUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      // Restore border in case of error
      if (element.style.border !== undefined) {
        element.style.border = '';
      }
      
      // Provide specific error messages for common mobile issues
      if (error instanceof Error) {
        if (error.message.includes('CORS') || error.message.includes('tainted') || error.message.includes('empty')) {
          console.error('Mobile canvas tainting detected - this should be fixed by base64 conversion');
        }
      }
      
      return undefined;
    }
  }, [provider, userImage, celebrityImage]);

  /* NEW: Primary mobile share function using Web Share API */
  const handleNativeShare = async () => {
    try {
      const dataUrl = await makeImage();
      if (!dataUrl) {
        alert('Failed to generate image. Please try again.');
        return;
      }
      
      // Convert dataUrl to blob and create proper File object
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File(
        [blob],
        `twin-${celebName.replace(/\s+/g, '-')}.png`,
        { type: 'image/png' }
      );
      
      // Check if Web Share API supports files
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: shareText,
          title: `My celebrity twin: ${celebName}!`
        });
        return;
      }
      
      // Fallback to download for mobile if Web Share API doesn't support files
      if (isMobile) {
        const a = document.createElement('a');
        a.download = file.name;
        a.href = dataUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      
      // Desktop fallback: copy to clipboard
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
    } catch (error) {
      console.error('Native share failed:', error);
      // Final fallback: trigger download
      try {
        const dataUrl = await makeImage();
        if (dataUrl) {
          const a = document.createElement('a');
          a.download = `twin-${celebName.replace(/\s+/g, '-')}-${providerKey}.png`;
          a.href = dataUrl;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          throw new Error('Could not generate image');
        }
      } catch (downloadError) {
        console.error('Download fallback failed:', downloadError);
        alert('Failed to share or save image. Please try again.');
      }
    }
  };

  const handleDownload = async () => {
    try {
      const dataUrl = await makeImage();
      if (!dataUrl) {
        alert('Failed to generate image. Please try again.');
        return;
      }
      const a = document.createElement('a');
      a.download = `twin-${celebName.replace(/\s+/g, '-')}-${providerKey}.png`;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleCopy = async () => {
    try {
      const dataUrl = await makeImage();
      if (!dataUrl) {
        alert('Failed to generate image. Please try again.');
        return;
      }
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy image. Please try again.');
    }
  };

  /* 2 ▸ provider‑specific share link - MOBILE: Use Web Share API, DESKTOP: Copy + open */
  const shareTo = async () => {
    try {
      const dataUrl = await makeImage();
      if (!dataUrl) {
        alert('Failed to generate image. Please try again.');
        return;
      }
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `twin-${celebName.replace(/\s+/g, '-')}.png`, { type: 'image/png' });
      
      /*
       * MOBILE: fall back to the system share sheet.
       * DESKTOP: keep the clipboard‑copy + new‑tab behaviour.
       */
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: shareText,
          title: `My celebrity twin: ${celebName}!`
        });
        return; // we're done – no need to open provider URL
      }
      
      // Desktop fallback (old behaviour)
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setSharesCopied(true);
      setTimeout(() => setSharesCopied(false), 2000);
      
      // Then open platform
      const u = encodeURIComponent(origin);
      const t = encodeURIComponent(shareText);
      const links: Record<ProviderKey, string> = {
        instagram: 'https://www.instagram.com',
        snapchat: 'https://web.snapchat.com',
        twitter: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
        tiktok: 'https://www.tiktok.com',
        pinterest: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}`,
      };
      
      const link = links[providerKey];
      // Wait a bit to show the copied state before opening
      setTimeout(() => {
        window.open(link, '_blank', 'width=600,height=500');
      }, 1500);
    } catch (error) {
      console.error('Failed to share:', error);
      alert('Failed to share image. Please try again.');
    }
  };

  /*–––––––––––––  RENDER  –––––––––––––*/
  const Wrapper = isMobile ? Drawer : Dialog;
  const WrapperContent = isMobile ? DrawerContent : DialogContent;

  return (
    <Wrapper open={open} onOpenChange={onOpenChange}>
      {isMobile && <DrawerHeader className="sr-only" />}
      <WrapperContent className={cn('focus:outline-none max-h-[90vh]', !isMobile && 'sm:max-w-md p-0')}>
        {/* CONTROLS */}
        <div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
          {/* provider select */}
          <div>
            <Label className="mb-2 block text-sm">Choose platform</Label>
            <Select value={providerKey} onValueChange={v => setProviderKey(v as ProviderKey)}>
              <SelectTrigger>
                <SelectValue>
                  <span className="flex items-center gap-2">
                    {provider.icon} {provider.label}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(providers).map(([k, p]) => (
                  <SelectItem key={k} value={k}>
                    <span className="flex items-center gap-2">
                      {p.icon} {p.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* text inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user">Your name</Label>
              <Input id="user" value={userName} onChange={e => setUserName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="celeb">Celebrity</Label>
              <Input id="celeb" value={celebName} onChange={e => setCelebName(e.target.value)} />
            </div>
          </div>

          {/* THE CARD (what gets captured) */}
          <div
            ref={cardRef}
            className={cn(cardClass, 'relative bg-white rounded-2xl border mx-auto flex flex-col overflow-hidden mt-4')}
            style={{
              ...(provider.ratio === '1/1' && {
                aspectRatio: '1 / 1',
                contain: 'layout size',
                overflow: 'hidden'
              })
            }}
          >
            {/* Images taking up the entire top portion */}
            <div className="flex flex-1 min-h-[60%] overflow-hidden rounded-t-2xl">
              {/* Your Photo - Left Side */}
              <div className="flex-1 relative bg-gray-100">
                <img 
                  src={userImage} 
                  alt={userName}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.log('User image failed to load:', userImage);
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="p-3">
                    <p className="text-white text-sm font-medium">{userName}</p>
                  </div>
                </div>
              </div>
              
              {/* VS Separator */}
              <div className="relative flex-shrink-0 flex items-stretch pointer-events-none z-20">
                <div className="w-[2px] bg-white/70 backdrop-blur-sm" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 text-gray-900 text-[10px] font-semibold leading-none px-2 py-0.5 rounded-full shadow-sm select-none">
                  VS
                </span>
              </div>
              
              {/* Celebrity Photo - Right Side */}
              <div className="flex-1 relative bg-gray-100">
                <img 
                  src={celebrityImage} 
                  alt={celebName}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="p-3">
                    <p className="text-white text-sm font-medium">{celebName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom text section */}
            <div className="p-6 space-y-4 max-h-[40%] overflow-y-auto">
              <div className="text-center space-y-2">
                <div className={cn("font-medium text-gray-900", percentageSize)}>
                  {percentage}%
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  facial similarity with {celebName}
                </p>
              </div>

              {/* tiny logo */}
              <div className="flex items-center gap-2 justify-center pt-2">
                <img src="/logo.png"
                     alt="logo" className="w-4 h-4 rounded opacity-60" />
                <span className="text-xs text-gray-500 font-medium">LookalikeCeleb</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-3">
            {/* PRIMARY SHARE BUTTON */}
            <Button 
              onClick={handleNativeShare} 
              disabled={isConverting}
              className={cn('w-full h-11 text-white rounded-lg',
                copied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-gray-800')}
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span className="ml-2">
                {isConverting ? 'Converting images...' : 
                 copied ? 'Copied Image!' : 
                 isMobile ? 'Share Result' : 'Share Image'}
              </span>
            </Button>

            {/* DESKTOP: Keep platform-specific sharing */}
            {!isMobile && (
              <Button 
                onClick={shareTo} 
                disabled={isConverting}
                className={cn('w-full h-11 text-white rounded-lg', 
                  sharesCopied ? 'bg-green-600 hover:bg-green-700' : provider.btn)}
              >
                {sharesCopied ? <Check className="w-4 h-4" /> : provider.icon} 
                <span className="ml-2">
                  {isConverting ? 'Converting images...' : 
                   sharesCopied ? 'Copied Image! Paste to share.' : `Share on ${provider.label}`}
                </span>
              </Button>
            )}

            {/* SECONDARY ACTIONS */}
            <div className={cn('space-y-3', isMobile ? 'pt-2' : '')}>
              {/* Save/Download - Always available */}
              <Button 
                onClick={handleDownload} 
                disabled={isConverting}
                variant="outline" 
                className="w-full h-11"
              >
                <Download className="w-4 h-4" /> 
                <span className="ml-2">
                  {isConverting ? 'Converting images...' : 
                   isMobile ? 'Save to Photos' : 'Save Image'}
                </span>
              </Button>

              {/* Copy - Desktop prominent, mobile hidden/de-emphasized */}
              {!isMobile && (
                <Button 
                  onClick={handleCopy} 
                  disabled={isConverting}
                  variant="outline"
                  className="w-full h-11"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="ml-2">
                    {isConverting ? 'Converting images...' : copied ? 'Copied!' : 'Copy Image'}
                  </span>
                </Button>
              )}
            </div>
          </div>

          {/* MOBILE: Platform sharing as secondary option */}
          {isMobile && (
            <div className="pt-4 border-t border-gray-200">
              <Label className="text-xs text-gray-500 mb-3 block">Or share to specific platform:</Label>
              <Button 
                onClick={shareTo} 
                disabled={isConverting}
                variant="outline"
                className="w-full h-10 text-sm"
              >
                {provider.icon} 
                <span className="ml-2">
                  {isConverting ? 'Converting...' : `Share to ${provider.label}`}
                </span>
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Opens native share sheet with image attached
              </p>
            </div>
          )}

          {/* Helper text for mobile */}
          {isMobile && (
            <p className="text-xs text-gray-500 text-center leading-relaxed pt-2">
              "Share Result" opens your phone's native share menu with all your apps
            </p>
          )}
        </div>
      </WrapperContent>
    </Wrapper>
  );
};

export default memo(ShareCard);
