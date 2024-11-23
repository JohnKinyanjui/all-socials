'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type Quill from 'quill';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TwitterIcon, CloudIcon, HashIcon } from 'lucide-react'

// Counter Module Class
class Counter {
  quill: any;
  container: HTMLElement;
  options: any;

  constructor(quill: any, options: any) {
    this.quill = quill;
    this.options = options;
    this.container = document.querySelector(options.container);
    quill.on('text-change', this.update.bind(this));
    this.update();  // Initialize counter
  }

  calculate() {
    let text = this.quill.getText();
    if (text.endsWith('\n')) {
      text = text.slice(0, -1);
    }
    if (this.options.unit === 'word') {
      return text ? text.match(/\S+/g).length : 0;
    }
    return text.length;
  }

  update() {
    const length = this.calculate();
    this.container.textContent = length.toString();
  }
}

// Dynamically import Quill
const QuillNoSSR = dynamic(
  async () => {
    const { default: RealQuill } = await import('quill');
    
    RealQuill.register('modules/counter', Counter);
    
    return function QuillWrapper({ forwardedRef, ...props }: { forwardedRef: any }) {
      useEffect(() => {
        if (!forwardedRef.current) return;

        if (!forwardedRef.current.quill) {
          import('quill/dist/quill.snow.css');
          const quill = new RealQuill(forwardedRef.current, {
            theme: 'snow',
            modules: {
              toolbar: false,
              counter: {
                container: '#counter',
                unit: 'character'
              }
            },
            placeholder: 'What are you doing?',
            ...props
          });

          forwardedRef.current.quill = quill;
        }
      }, [forwardedRef, props]);

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

  const MAX_LIMIT = 500;
  const TWITTER_LIMIT = 280;
  const BLUESKY_LIMIT = 300;

  useEffect(() => {
    const handleTextChange = () => {
      const text = editorRef.current?.quill.getText();
      const count = text.endsWith('\n') ? text.length - 1 : text.length;
      setIsOverLimit(count > MAX_LIMIT);
    };

    if (editorRef.current?.quill) {
      editorRef.current.quill.on('text-change', handleTextChange);
    }

    return () => {
      if (editorRef.current?.quill) {
        editorRef.current.quill.off('text-change', handleTextChange);
      }
    };
  }, [MAX_LIMIT]);

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
    <div className="w-full max-w-[850px] mx-auto p-4 bg-[#9AE4E8] min-h-screen">
      <main>
        <div className="bg-white rounded-md shadow-md p-8 mb-4">
          <h2 className="text-5xl mb-8 text-[#1E5162] font-bold text-center py-4">Post to all text based socials at once</h2>
          <div className="bg-white rounded-lg min-h-[100px] mb-2">
            <QuillNoSSR forwardedRef={editorRef} />
          </div>
          <div className="text-sm text-[#1E5162]">
            <span id="counter">0</span> characters
          </div>
        </div>
        <div className="bg-white rounded-md shadow-md p-6">
          <h3 className="text-2xl mb-4 text-[#1E5162] font-bold">Post to:</h3>
          <div className="flex justify-between items-center">
            {['twitter', 'bluesky', 'threads'].map((platform) => (
              <div key={platform} className="flex items-center space-x-3">
                <Checkbox
                  id={platform}
                  checked={platforms[platform]}
                  onCheckedChange={(checked) => setPlatforms(prev => ({ ...prev, [platform]: checked === true }))}
                  className="w-5 h-5"
                />
                <Label htmlFor={platform} className="text-lg flex items-center space-x-2 cursor-pointer">
                  {platform === 'twitter' && <TwitterIcon className="h-6 w-6" />}
                  {platform === 'bluesky' && <CloudIcon className="h-6 w-6" />}
                  {platform === 'threads' && <HashIcon className="h-6 w-6" />}
                  <span className="capitalize">{platform}</span>
                  {postStatus[platform] === 'loading' && <span className="text-sm text-gray-500">(Updating...)</span>}
                  {postStatus[platform] === 'success' && <span className="text-green-500">✓</span>}
                  {postStatus[platform] === 'error' && <span className="text-red-500">×</span>}
                </Label>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Limits: Twitter ({TWITTER_LIMIT}), Bluesky ({BLUESKY_LIMIT})
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handlePost}
              disabled={isOverLimit || isPosting}
              className={`${
                isOverLimit || isPosting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#89D5E2] hover:bg-[#7BC5D2] text-[#1E5162]'
              } font-bold px-8 py-2 text-lg`}
            >
              {isPosting ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
