import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { content } = req.body;
  const threadsUserId = process.env.THREADS_USER_ID!;
  const accessToken = process.env.THREADS_ACCESS_TOKEN!;

  if (!content) {
    return res.status(400).json({ success: false, error: 'Content is required' });
  }

  if (!threadsUserId || !accessToken) {
    return res.status(500).json({ success: false, error: 'Missing environment variables' });
  }

  try {
    console.log('Creating Threads post container...');
    
    // Step 1: Create the post container
    const createResponse = await axios.post(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads`,
      null,
      {
        params: {
          text: content,
          access_token: accessToken,
          media_type: 'TEXT'
        },
      }
    );

    console.log('Create response:', createResponse.data);

    if (!createResponse.data.id) {
      throw new Error('Failed to get post container ID');
    }

    // Step 2: Publish the post
    console.log('Publishing Threads post...');
    const publishResponse = await axios.post(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish`,
      null,
      {
        params: {
          creation_id: createResponse.data.id,
          access_token: accessToken,
        },
      }
    );

    console.log('Publish response:', publishResponse.data);
    res.status(200).json({ 
      success: true, 
      data: {
        create: createResponse.data,
        publish: publishResponse.data
      }
    });
  } catch (error: any) {
    console.error('Threads API Error:', {
      message: error.message,
      response: error.response?.data || error.response,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        params: error.config?.params,
      }
    });
    
    const errorMessage = 
      error.response?.data?.error?.message || 
      error.response?.data?.message || 
      error.message || 
      'Unknown error';
      
    res.status(error.response?.status || 500).json({ 
      success: false, 
      error: errorMessage,
      details: {
        status: error.response?.status,
        data: error.response?.data
      }
    });
  }
}
