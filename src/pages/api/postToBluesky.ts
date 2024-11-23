import { NextApiRequest, NextApiResponse } from 'next';
import { BskyAgent } from '@atproto/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, error: 'Content is required' });
  }

  const agent = new BskyAgent({ service: process.env.BLUESKY_SERVICE });

  try {
    // Login to Bluesky
    await agent.login({
      identifier: process.env.BLUESKY_USERNAME!,
      password: process.env.BLUESKY_PASSWORD!,
    });

    // Create the post
    const response = await agent.post({
      text: content,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, data: response });
  } catch (error: any) {
    console.error('Error posting to Bluesky:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to post to Bluesky' 
    });
  }
}
