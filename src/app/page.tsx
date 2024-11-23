import Image from "next/image";
import Editor from '@/components/Editor';
import { Share2Icon } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#9AE4E8] font-sans">
      <div className="max-w-[850px] mx-auto p-4">
        <header className="flex justify-between items-center py-4 border-b border-[#1E5162]">
          <div className="flex items-center space-x-2">
            <Share2Icon className="h-8 w-8 text-[#1E5162]" />
            <h1 className="text-2xl font-bold text-[#1E5162]">All Socials</h1>
          </div>
        </header>
        
        <main className="mt-6">
          <Editor />
        </main>
        
        <footer className="mt-8 pt-4 border-t border-[#1E5162] flex flex-wrap items-center justify-center gap-6 text-sm text-[#1E5162]">
          <a
            className="flex items-center gap-2 hover:underline"
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/file.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
            Learn
          </a>
          <a
            className="flex items-center gap-2 hover:underline"
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/window.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
            Examples
          </a>
          <a
            className="flex items-center gap-2 hover:underline"
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/globe.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
            Go to nextjs.org →
          </a>
        </footer>
      </div>
    </div>
  );
}
