# All Socials - Post to Multiple Social Media Platforms

A modern web application that allows you to post content to multiple social media platforms simultaneously. Currently supports:

- Twitter/X
- Bluesky
- Threads

## Features

- 📝 Rich text editor with character count
- 🔄 Simultaneous posting to multiple platforms
- 📊 Real-time character limit tracking for each platform
- 🎨 Modern, responsive UI
- ⚡ Fast and reliable posting with error handling

## Prerequisites

Before running this application, you'll need:

1. Node.js 18+ installed
2. API keys/credentials for the platforms you want to post to:
   - Twitter/X API credentials
   - Bluesky username and password
   - Threads/Instagram access token

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Twitter/X
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret

# Bluesky
BLUESKY_SERVICE=https://bsky.social
BLUESKY_USERNAME=your_username
BLUESKY_PASSWORD=your_password

# Threads/Instagram
THREADS_USER_ID=your_user_id
THREADS_ACCESS_TOKEN=your_access_token
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Quill](https://quilljs.com/) - Rich Text Editor
- [Radix UI](https://www.radix-ui.com/) - UI Components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
