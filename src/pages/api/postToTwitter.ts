import { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';

// Initialize the Twitter client with credentials from environment variables
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Create the tweet
    const tweet = await client.v2.tweet(content);

    return res.status(200).json({
      success: true,
      data: tweet,
    });
  } catch (error) {
    console.error('Error posting to Twitter:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to post to Twitter',
    });
  }
}
