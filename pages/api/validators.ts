// pages/api/validators.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { limit = '10', key } = req.query;

  try {
    let url = `https://grpc-node1.nowa.finance/cosmos/staking/v1beta1/validators?pagination.limit=${limit}`;
    
    if (key && typeof key === 'string') {
      url += `&pagination.key=${encodeURIComponent(key)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching validators:', error);
    res.status(500).json({ 
      error: 'Failed to fetch validators',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}