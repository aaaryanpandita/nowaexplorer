export interface ApiRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface ProverBatch {
  number: number;
  batchHash: string;
  txHash: string;
  timestamp: number;
  newStateRoot: string;
  submitter?: string;
  status: string;
  txHashes: string[]; // Added txHashes array
}

// Match the actual API response structure
interface ProverBatchResponse {
  batchNumber: number;
  batchHash: string;
  newStateRoot: string;
  submitter: string;
  timestamp: number;
  verified_at: number;
   status: number | string;
  txHash: string;
  txHashes: string[];
}

interface PaginatedBatchesResponse {
  batches: ProverBatchResponse[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const BASE_URL = "http://172.16.16.174:8081";

// Helper function to convert numeric status to string
function getStatusString(status: number | string): string {
  const statusCode = typeof status === 'string' ? parseInt(status, 10) : status;
  
  //console.log('Status code:', statusCode);
  switch (statusCode) {
    case 0:
      return "pending";
    case 1:
      return "verified";
    default:
      return "unknown";
  }

  
}

// Helper function to transform API response to ProverBatch
function transformBatchResponse(data: ProverBatchResponse): ProverBatch {
  return {
    number: data.batchNumber,
    batchHash: data.batchHash,
    txHash: data.txHash,
    timestamp: data.timestamp,
    newStateRoot: data.newStateRoot,
    submitter: data.submitter,
    status: getStatusString(data.status),
    txHashes: data.txHashes || [], // Include txHashes array
  };
}

/**
 * Get batches with pagination using the new endpoint
 */
export async function getBatchesPaginated(
  page: number = 1,
  limit: number = 10,
  options?: ApiRequestOptions
): Promise<{ batches: ProverBatch[]; total: number; totalPages: number; hasMore: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BASE_URL}/batches?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: options?.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json() as PaginatedBatchesResponse;
    
    const batches = data.batches.map(batch => transformBatchResponse(batch));
    
    return {
      batches,
      total: data.count,
      totalPages: data.total_pages,
      hasMore: page < data.total_pages
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - API server not responding');
      }
      throw new Error(`Network error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get the latest batch
 */
export async function getLatestBatch(options?: ApiRequestOptions): Promise<ProverBatch> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BASE_URL}/batches/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: options?.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json() as ProverBatchResponse;
    return transformBatchResponse(data);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - API server not responding');
      }
      throw new Error(`Network error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get a specific batch by number
 */
export async function getBatchByNumber(
  batchNumber: number,
  options?: ApiRequestOptions
): Promise<ProverBatch> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BASE_URL}/batches/${batchNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: options?.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json() as ProverBatchResponse;
    return transformBatchResponse(data);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Timeout fetching batch ${batchNumber}`);
      }
      throw new Error(`Failed to fetch batch ${batchNumber}: ${error.message}`);
    }
    throw error;
  }
}