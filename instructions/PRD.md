# **Product Requirements Document (PRD)**

## **1. Overview**

An application prototype that allows users to compose a rich text post and publish it simultaneously to Twitter (X), Bluesky, and Threads. The prototype focuses on the core functionality of writing content in a rich text editor and posting it to the three platforms at once, without implementing full user authentication flows or login screens.

---

## **2. Objectives**

- Enable users to compose rich text content using a text editor.
- Implement character limit validation based on the maximum length of a single text post on the three platforms (X - 280 characters, Bluesky - 300 characters, Threads - 500 characters).
- Post the composed content to Twitter, Bluesky, and Threads simultaneously.
- Provide confirmation of successful posting to each platform.
- Exclude user authentication flows and account management for the prototype.

---

## **3. Tech Stack**

- **Frontend Framework:** Next.js 14
- **Server Runtime:** Node.js 18
- **UI Components:** shadcn UI library
- **Rich Text Editor:** Quill
- **APIs:**
  - Twitter API (`twitter-api-v2` npm package)
  - Bluesky API (`@atproto/api` npm package)
  - Threads API (HTTP requests)
- **Styling:** Tailwind CSS
- **Utilities:** ESLint, Prettier, TypeScript

---

## **4. Features**

1. **Rich Text Editor:**
   - Integration of Quill editor for composing posts with basic formatting options.

2. **Character Limit Validation:**
   - Implement character limit checks based on Twitter's 280-character limit.
   - Real-time feedback on character count.

3. **Multi-Platform Posting:**
   - Single button to post content to all three platforms.
   - Handle API requests to each platform using predefined access tokens.

4. **Posting Confirmation:**
   - Display success or error messages for each platform after posting.
   - Update UI to reflect the posting status.

---

## **5. Implementation Plan**

### **Step 1: Project Setup**

- **Objective:** Install required dependencies and file structure.

**Tasks:**

- Install required dependencies:

  ```bash
  npm install quill @atproto/api twitter-api-v2 tailwindcss shadcn-ui
  ```

- Set up Tailwind CSS:

  ```bash
  npx tailwindcss init -p
  ```

- Install ESLint and Prettier for code linting and formatting.

- Create the project file structure as specified in the final file structure section.

---

### **Step 2: Integrate Quill Rich Text Editor**

- **Objective:** Implement Quill as the rich text editor.

**Tasks:**

- Install Quill:

  ```bash
  npm install quill
  ```

- Import Quill in the main editor component (`page.tsx` or `Editor.tsx`).

- Include the Quill stylesheet in `layout.tsx` or `index.tsx`:

  ```jsx
  import 'quill/dist/quill.snow.css';
  ```

- Initialize Quill in the editor component:

  ```jsx
  import Quill from 'quill';
  import { useEffect, useRef } from 'react';

  const Editor = () => {
    const quillRef = useRef(null);

    useEffect(() => {
      if (quillRef.current) return; // Skip if Quill is already initialized

      const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
          toolbar: [['bold', 'italic', 'underline'], ['link']],
        },
      });

      quillRef.current = quill;
    }, []);

    return <div id="editor" style={{ height: '300px' }} />;
  };

  export default Editor;
  ```

**Implementation Details:**

- Customize the toolbar to include basic formatting options.

- Ensure the editor's content can be retrieved when the user clicks the post button.

---

### **Step 3: Mention Character Limit**

- **Objective:** Give real time feedback on character count. And show limits of all three platforms.

**Tasks:**

- Add a character counter below the editor that updates as the user types.

- Implement a function to retrieve the plain text from Quill:

  ```jsx
  const getTextLength = () => {
    return quillRef.current.getText().trim().length;
  };
  ```

- Use `quill.on('text-change', callback)` to monitor changes and update the character count.

- Display a warning or disable the post button if the limit is exceeded.

**Implementation Details:**

- Use React state to manage the character count.

- Style the character counter to change color when approaching or exceeding the limit.

---

### **Step 4: Set Up API Access Tokens**

- **Objective:** Prepare access tokens for each platform to be used in API calls.

**Tasks:**

- For the prototype, use personal access tokens or API keys for your own accounts.

- Store the tokens securely in a `.env.local` file (do not commit this file to version control).

  ```dotenv
  TWITTER_API_KEY=your_twitter_api_key
  TWITTER_API_SECRET=your_twitter_api_secret
  TWITTER_ACCESS_TOKEN=your_twitter_access_token
  TWITTER_ACCESS_SECRET=your_twitter_access_secret

  BLUESKY_SERVICE=https://bsky.social
  BLUESKY_USERNAME=your_bluesky_username
  BLUESKY_PASSWORD=your_bluesky_password

  THREADS_USER_ID=your_threads_user_id
  THREADS_ACCESS_TOKEN=your_threads_access_token
  ```

**Implementation Details:**

- Ensure that you comply with each platform's terms of service when using personal tokens.

- Be cautious with sensitive information; never expose tokens in client-side code.

---

### **Step 5: Implement Posting Functionality to Twitter (X)**

- **Objective:** Enable posting to Twitter using the `twitter-api-v2` package.

**Tasks:**

- Create an API route `src/pages/api/postToTwitter.ts` that:

  - Receives the content to be posted.

  - Uses the access tokens from environment variables to authenticate.

  - Posts the content using `client.v1.tweet()` method.

**Implementation Details:**

- **`postToTwitter.ts`:**

  ```typescript
  import { NextApiRequest, NextApiResponse } from 'next';
  import { TwitterApi } from 'twitter-api-v2';

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { content } = req.body;

    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });

    try {
      const response = await client.v1.tweet(content);
      res.status(200).json({ success: true, data: response });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  ```

- Ensure the API route handles errors gracefully.

---

### **Step 6: Implement Posting Functionality to Bluesky**

- **Objective:** Enable posting to Bluesky using the `@atproto/api` package.

**Tasks:**

- Create an API route `src/pages/api/postToBluesky.ts` that:

  - Receives the content to be posted.

  - Authenticates using the user's username and password (for the prototype).

  - Posts the content using `agent.post()` method.

**Implementation Details:**

- **`postToBluesky.ts`:**

  ```typescript
  import { NextApiRequest, NextApiResponse } from 'next';
  import { AtpAgent } from '@atproto/api';

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { content } = req.body;

    const agent = new AtpAgent({ service: process.env.BLUESKY_SERVICE });

    try {
      await agent.login({
        identifier: process.env.BLUESKY_USERNAME!,
        password: process.env.BLUESKY_PASSWORD!,
      });

      const response = await agent.post({
        $type: 'app.bsky.feed.post',
        text: content,
        createdAt: new Date().toISOString(),
      });

      res.status(200).json({ success: true, data: response });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  ```

- Be cautious with storing credentials; this approach is acceptable for a prototype but not recommended for production.

---

### **Step 7: Implement Posting Functionality to Threads**

- **Objective:** Enable posting to Threads using HTTP requests.

**Tasks:**

- Create an API route `src/pages/api/postToThreads.ts` that:

  - Receives the content to be posted.

  - Uses the access token and user ID from environment variables.

  - Creates a media container and publishes it.

**Implementation Details:**

- **`postToThreads.ts`:**

  ```typescript
  import { NextApiRequest, NextApiResponse } from 'next';
  import axios from 'axios';

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { content } = req.body;
    const threadsUserId = process.env.THREADS_USER_ID!;
    const accessToken = process.env.THREADS_ACCESS_TOKEN!;

    try {
      // Step 1: Create media container
      const createResponse = await axios.post(
        `https://graph.threads.net/v1.0/${threadsUserId}/threads`,
        null,
        {
          params: {
            media_type: 'TEXT',
            text: content,
            access_token: accessToken,
          },
        }
      );

      const mediaContainerId = createResponse.data.id;

      // Optional: Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Reduced delay for prototype

      // Step 2: Publish the container
      const publishResponse = await axios.post(
        `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish`,
        null,
        {
          params: {
            creation_id: mediaContainerId,
            access_token: accessToken,
          },
        }
      );

      res.status(200).json({ success: true, data: publishResponse.data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  ```

- Adjust delays as needed for the prototype.

---

### **Step 8: Implement the Post Button and Handle Responses**

- **Objective:** Connect the frontend with the backend API routes and provide feedback to the user.

**Tasks:**

- Add a "Post to All" button in your editor component.

- On button click:

  - Retrieve the content from Quill.

  - Send POST requests to each API route (`postToTwitter`, `postToBluesky`, `postToThreads`).

  - Update the UI to reflect the posting status for each platform.

**Implementation Details:**

- **Frontend Code (e.g., in `Editor.tsx`):**

  ```jsx
  const [postingStatus, setPostingStatus] = useState({
    twitter: null,
    bluesky: null,
    threads: null,
  });

  const handlePost = async () => {
    const content = quillRef.current.getText().trim();

    setPostingStatus({ twitter: 'loading', bluesky: 'loading', threads: 'loading' });

    try {
      const twitterResponse = await fetch('/api/postToTwitter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const twitterResult = await twitterResponse.json();

      setPostingStatus((prev) => ({
        ...prev,
        twitter: twitterResult.success ? 'success' : 'error',
      }));
    } catch {
      setPostingStatus((prev) => ({ ...prev, twitter: 'error' }));
    }

    // Repeat for Bluesky and Threads
    // ...
  };
  ```

- Display the posting status next to each platform's name.

---

### **Step 9: Error Handling and User Feedback**

- **Objective:** Ensure the user is informed of the success or failure of each posting action.

**Tasks:**

- Update the UI to show:

  - Success messages when posts are successfully published.

  - Error messages if any post fails.

- Handle edge cases, such as exceeding character limits or network errors.

**Implementation Details:**

- Use conditional rendering to display different messages or icons based on the posting status.

- Ensure that the application remains responsive and does not freeze during network requests.

---

## **6. Final File Structure**

```
all-socials/
├── .eslintrc.json
├── .gitignore
├── .env.local
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── README.md
├── public/
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── postToTwitter.ts
│   │   │   ├── postToBluesky.ts
│   │   │   └── postToThreads.ts
│   │   └── index.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── components/
│   │   ├── Editor.tsx
│   │   └── CharacterCounter.tsx
│   └── app/
│       ├── layout.tsx
│       └── page.tsx
└── instructions/
    └── PRD.md
```
