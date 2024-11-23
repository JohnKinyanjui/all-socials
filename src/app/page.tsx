import Editor from '@/components/Editor';
import { Share2Icon } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <div className="max-w-[750px] mx-auto px-4 py-6">
        <header className="flex justify-between items-center py-6 mb-8">
          <div className="flex items-center space-x-3">
            <Share2Icon className="h-6 w-6 text-blue-500" />
            <h1 className="text-3xl font-medium text-gray-900">Post to all text based socials at once</h1>
          </div>
        </header>
        
        <main>
          <Editor />
        </main>
      </div>
    </div>
  );
}
