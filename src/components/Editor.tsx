'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type Quill from 'quill';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CircleProgress } from "@/components/ui/circle-progress"
import Image from 'next/image'

// Counter Module Class
class Counter {
  quill: any;
  callback: (count: number) => void;

  constructor(quill: any, callback: (count: number) => void) {
    this.quill = quill;
    this.callback = callback;
    quill.on('text-change', this.update.bind(this));
    this.update();  // Initialize counter
  }

  calculate() {
    let text = this.quill.getText();
    if (text.endsWith('\n')) {
      text = text.slice(0, -1);
    }
    return text.length;
  }

  update() {
    const length = this.calculate();
    this.callback(length);
  }
}

// Dynamically import Quill
const QuillNoSSR = dynamic(
  async () => {
    const { default: RealQuill } = await import('quill');
    
    return function QuillWrapper({ forwardedRef, onTextChange, ...props }: { forwardedRef: any, onTextChange: (count: number) => void }) {
      useEffect(() => {
        if (!forwardedRef.current) return;

        if (!forwardedRef.current.quill) {
          import('quill/dist/quill.snow.css');
          const quill = new RealQuill(forwardedRef.current, {
            theme: 'snow',
            modules: {
              toolbar: false,
            },
            placeholder: 'What are you doing?',
            ...props
          });

          // Initialize counter with callback
          new Counter(quill, onTextChange);

          forwardedRef.current.quill = quill;
        }
      }, [forwardedRef, onTextChange, props]);

      return <div ref={forwardedRef} />;
    };
  },
  { ssr: false }
);

export default function RetroTwitterEditor() {
  const editorRef = useRef<any>(null);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [platforms, setPlatforms] = useState({
    twitter: true,
    bluesky: true,
    threads: true,
  });
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState<{
    [key: string]: 'idle' | 'loading' | 'success' | 'error'
  }>({
    twitter: 'idle',
    bluesky: 'idle',
    threads: 'idle',
  });
  const [progress, setProgress] = useState({
    twitter: { count: 0, limit: 280, percentage: 0 },
    bluesky: { count: 0, limit: 300, percentage: 0 },
    threads: { count: 0, limit: 500, percentage: 0 },
  });

  const MAX_LIMIT = 500;
  const TWITTER_LIMIT = 280;
  const BLUESKY_LIMIT = 300;

  const handleTextChange = (count: number) => {
    setProgress({
      twitter: { count, limit: TWITTER_LIMIT, percentage: (count / TWITTER_LIMIT) * 100 },
      bluesky: { count, limit: BLUESKY_LIMIT, percentage: (count / BLUESKY_LIMIT) * 100 },
      threads: { count, limit: MAX_LIMIT, percentage: (count / MAX_LIMIT) * 100 },
    });
    setIsOverLimit(count > MAX_LIMIT);
  };

  const handlePost = async () => {
    if (!editorRef.current?.quill) return;

    const quill = editorRef.current.quill;
    const text = quill.getText().trim();
    
    if (!text) return;

    setIsPosting(true);
    const selectedPlatforms = Object.entries(platforms)
      .filter(([_, isSelected]) => isSelected)
      .map(([platform]) => platform);

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      setIsPosting(false);
      return;
    }

    try {
      const postPromises = selectedPlatforms.map(async (platform) => {
        setPostStatus(prev => ({ ...prev, [platform]: 'loading' }));
        try {
          console.log(`Posting to ${platform}...`);
          const response = await fetch(`/api/postTo${platform.charAt(0).toUpperCase() + platform.slice(1)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: text }),
          });

          const result = await response.json();
          
          if (!response.ok) {
            console.error(`Error response from ${platform}:`, result);
            throw new Error(result.error || `Failed to post to ${platform}`);
          }

          console.log(`Success posting to ${platform}:`, result);
          setPostStatus(prev => ({ ...prev, [platform]: 'success' }));
          return result;
        } catch (error: any) {
          console.error(`Error posting to ${platform}:`, {
            message: error.message,
            details: error.details
          });
          setPostStatus(prev => ({ ...prev, [platform]: 'error' }));
          throw error;
        }
      });

      await Promise.allSettled(postPromises);
      
      if (Object.values(postStatus).some(status => status === 'success')) {
        quill.setText('');
      }
    } catch (error) {
      console.error('Error posting:', error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="mb-6">
          <QuillNoSSR
            forwardedRef={editorRef}
            onTextChange={handleTextChange}
            className="prose max-w-none focus:outline-none"
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col divide-y divide-gray-100">
            {Object.entries(platforms).map(([platform, isEnabled]) => (
              <div key={platform} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={platform}
                    checked={isEnabled}
                    onCheckedChange={(checked) =>
                      setPlatforms((prev) => ({ ...prev, [platform]: !!checked }))
                    }
                    className="border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label htmlFor={platform} className="flex items-center space-x-2.5 text-gray-700 capitalize select-none cursor-pointer">
                    {platform === 'twitter' && (
                      <Image
                        src="/twitter-x-logo-png-9.png"
                        alt="Twitter/X Logo"
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    )}
                    {platform === 'bluesky' && (
                      <Image
                        src="/Bluesky_Logo.svg"
                        alt="Bluesky Logo"
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    )}
                    {platform === 'threads' && (
                      <Image
                        src="/Threads_(app)_logo.svg.png"
                        alt="Threads Logo"
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    )}
                    <span className="text-sm font-medium">{platform}</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 tabular-nums">
                    {progress[platform].count}/{progress[platform].limit}
                  </span>
                  <CircleProgress
                    value={progress[platform].percentage}
                    className={progress[platform].percentage > 100 ? 'text-red-500' : 'text-blue-500'}
                    size={20}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button
              onClick={handlePost}
              disabled={isOverLimit || isPosting || !Object.values(platforms).some(Boolean)}
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm disabled:shadow-none disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
            >
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}