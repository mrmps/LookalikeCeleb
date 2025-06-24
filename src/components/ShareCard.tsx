// ShareCard.tsx
import React, {
  useRef, useState, useMemo, useCallback, memo, useEffect,
} from 'react';
import {
  Download, Copy, Check, Instagram, Facebook, Twitter,
  Linkedin, Palette, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader } from '@/components/ui/drawer';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import * as htmlToImage from 'html-to-image';           // <–– NEW (handles CORS, font embedding, @2x etc.)
import { cn } from '@/lib/utils';

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
  const [accent, setAccent] = useState('#000000');
  const [copied, setCopied] = useState(false);

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
          // Timeout after 3 seconds
          setTimeout(() => resolve(), 3000);
        });
      }));
      
      // Additional small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
        throw new Error('Generated image is empty');
      }
      
      return dataUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      // Restore border in case of error
      if (element.style.border !== undefined) {
        element.style.border = '';
      }
      return undefined;
    }
  }, [provider]);

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
      a.click();
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

  /* 2 ▸ provider‑specific share link */
  const shareTo = () => {
    const u = encodeURIComponent(origin);
    const t = encodeURIComponent(shareText);
    const links: Record<ProviderKey, string | undefined> = {
      instagram: undefined,
      snapchat: undefined,
      twitter: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      tiktok: undefined,
      pinterest: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}`,
    };
    const link = links[providerKey];
    if (!link) {
      navigator.clipboard.writeText(`${shareText} ${origin}`);
      alert('Caption copied – paste it inside the app!');
    } else {
      window.open(link, '_blank', 'width=600,height=500');
    }
  };

  /*–––––––––––––  RENDER  –––––––––––––*/
  const Wrapper = isMobile ? Drawer : Dialog;
  const WrapperContent = isMobile ? DrawerContent : DialogContent;

  return (
    <Wrapper open={open} onOpenChange={onOpenChange}>
      {isMobile && <DrawerHeader className="sr-only" />}
      <WrapperContent className={cn('focus:outline-none', !isMobile && 'sm:max-w-md')}>
        {/* CONTROLS */}
        <div className="space-y-6 p-6 max-h-[85vh] sm:max-h-[90vh] md:max-h-[95vh] overflow-y-auto">
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

          {/* text + accent */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user">Your name</Label>
              <Input id="user" value={userName} onChange={e => setUserName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="celeb">Celebrity</Label>
              <Input id="celeb" value={celebName} onChange={e => setCelebName(e.target.value)} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Label htmlFor="accent"><Palette className="w-4 h-4" /></Label>
              <Input
                id="accent" type="color" className="w-10 p-0"
                value={accent} onChange={e => setAccent(e.target.value)}
              />
              <Input
                value={accent} onChange={e => setAccent(e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>

          {/* THE CARD (what gets captured) */}
          <div
            ref={cardRef}
            className={cn(cardClass, 'relative bg-white rounded-2xl border mx-auto flex flex-col justify-center items-center p-6 mt-4')}
            style={{
              ...(provider.ratio === '1/1' && {
                aspectRatio: '1 / 1',
                contain: 'layout size',
                overflow: 'hidden'
              })
            }}
          >
            {/* subtle sparkles */}
            <Sparkles className="absolute top-4 left-4 w-4 h-4 opacity-20"
                      style={{ color: accent }} />
            <Sparkles className="absolute bottom-4 right-4 w-3 h-3 opacity-20"
                      style={{ color: accent }} />

            <h2 className="text-center leading-tight font-bold mb-4">
              YOU AND {celebName.toUpperCase()}?<br />
              <span className="text-3xl" style={{ color: accent }}>{percentage}% TWIN!</span>
            </h2>

            <div className="relative flex items-center justify-center mb-4 gap-4">
              {/* user */}
              <figure className={cn(imgSize, 'rounded-full overflow-hidden border-4 border-white')}>
                <img 
                  src={userImage} 
                  alt={userName} 
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.log('User image failed to load:', userImage);
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                />
              </figure>
              {/* badge */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="rounded-full bg-white border-4 flex flex-col items-center justify-center w-16 h-16"
                     style={{ borderColor: accent }}>
                  <span className="font-black text-sm" style={{ color: accent }}>{percentage}%</span>
                  <span className="text-[10px] font-bold">MATCH</span>
                </div>
              </div>
              {/* celeb */}
              <figure className={cn(imgSize, 'rounded-full overflow-hidden border-4 border-white')}>
                <img src={celebrityImage} alt={celebName} className="object-cover w-full h-full" />
              </figure>
            </div>

            {/* names under images */}
            <div className="flex items-center justify-center w-full gap-4 text-xs font-medium text-gray-700">
              <span className={cn(imgSize, 'text-center truncate')} title={userName}>{userName}</span>
              <div className="w-16"></div> {/* spacer for badge */}
              <span className={cn(imgSize, 'text-center truncate')} title={celebName}>{celebName}</span>
            </div>

            {/* tiny logo */}
            <div className="flex items-center gap-2 mt-4">
              <img src="/lovable-uploads/d24d594a-33ec-4302-b4c9-8235382d96ff.png"
                   alt="logo" className="w-5 h-5 rounded" />
              <span className="text-sm font-semibold text-gray-700">LookalikeCeleb</span>
            </div>
          </div>



          {/* ACTION BUTTONS */}
          <div className="space-y-3">
            <Button onClick={handleCopy} className={cn('w-full h-11 text-white rounded-lg',
              copied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-gray-800')}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2">{copied ? 'Copied!' : 'Copy image'}</span>
            </Button>

            <Button onClick={shareTo} className={cn('w-full h-11 text-white rounded-lg', provider.btn)}>
              {provider.icon} <span className="ml-2">Share on {provider.label}</span>
            </Button>

            <Button onClick={handleDownload} variant="outline" className="w-full h-11">
              <Download className="w-4 h-4" /> <span className="ml-2">Save image</span>
            </Button>
          </div>
        </div>
      </WrapperContent>
    </Wrapper>
  );
};

export default memo(ShareCard);
