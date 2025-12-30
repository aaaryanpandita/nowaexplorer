import {
  Box,
  Heading,
  Text,
  Badge,
  Spinner,
  Flex,
  Container,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getBatchByNumber, type ProverBatch } from '../../types/api/batch';
import { SEPOLIA_TX_URL } from '../../types/api/tx';
import BLOCKSCOUT_BASE_URL from './blockscout_base';

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

// Update this with your actual Blockscout instance URL
// const BLOCKSCOUT_BASE_URL = BLOCKSCOUT_BASE_URL; // Change to your Blockscout API URL

const BatchDetailPage = () => {
  const router = useRouter();
  const { batchNumber } = router.query;

  const [batch, setBatch] = useState<ProverBatch | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'transactions'>('details');

  const formatTimestamp = (unixTimestamp: number): string => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const truncateHash = (
    value?: string | null,
    startChars = 6,
    endChars = 4
  ): string => {
    if (!value) return '—';
    if (value.length <= startChars + endChars) return value;
    return `${value.slice(0, startChars)}...${value.slice(-endChars)}`;
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(text);
      setTimeout(() => setCopiedHash(null), 1500);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // Fetch transaction details from Blockscout API
  const fetchTransactionDetails = async (txHash: string): Promise<Transaction | null> => {
    try {
      // FIXED: Changed backtick to parenthesis
      const response = await fetch(`${BLOCKSCOUT_BASE_URL}/v2/transactions/${txHash}`);

      if (!response.ok) {
        // FIXED: Changed backtick to parenthesis
        console.error(`Failed to fetch transaction ${txHash}`);
        return null;
      }

      const txData = await response.json() as {
        hash: string;
        from?: { hash: string };
        to?: { hash: string };
        created_contract?: { hash: string };
        value?: string;
        timestamp?: string;
      };

      // Parse the response based on Blockscout API structure
      return {
        hash: txData.hash,
        from: txData.from?.hash || '—',
        to: txData.to?.hash || txData.created_contract?.hash || '—',
        value: txData.value ? (parseInt(txData.value) / 1e18).toFixed(4) : '0.0',
        timestamp: txData.timestamp ? new Date(txData.timestamp).getTime() / 1000 : 0,
      };
    } catch (err) {
      // FIXED: Changed backtick to parenthesis
      console.error(`Error fetching transaction ${txHash}:`, err);
      return null;
    }
  };

  const fetchBatchDetails = async (batchNum: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getBatchByNumber(batchNum);
      setBatch(data);

      // Fetch real transaction details from Blockscout
      if (data.txHashes && data.txHashes.length > 0) {
        setLoadingTransactions(true);

        // Fetch all transactions in parallel
        const transactionPromises = data.txHashes.map(hash => fetchTransactionDetails(hash));
        const transactionResults = await Promise.all(transactionPromises);

        // Filter out null results (failed fetches)
        const validTransactions = transactionResults.filter((tx): tx is Transaction => tx !== null);

      
        setTransactions(validTransactions);
        setLoadingTransactions(false);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch batch details');
      console.error('Error fetching batch details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof batchNumber === 'string') {
      fetchBatchDetails(Number(batchNumber));
    }
  }, [batchNumber]);

  const handleTransactionClick = (txHash: string) => {
    router.push({
      pathname: '/tx/[hash]',
      query: { hash: txHash },
    });
  };

  if (loading) {
    return (
      <Box minH="100vh" py={12}>
        <Container maxW="container.xl">
          <Flex justifyContent="center" alignItems="center" minH="500px" flexDirection="column" gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.500" fontSize="sm">Loading batch details...</Text>
          </Flex>
        </Container>
      </Box>
    );
  }

  if (error || !batch) {
    return (
      <Box minH="100vh" py={12}>
        <Container maxW="container.xl">
          <Box
            bg="red.50"
            borderWidth="2px"
            borderColor="red.200"
            borderRadius="xl"
            p={8}
            textAlign="center"
          >
            <Heading size="md" color="red.800" mb={3}>
              ⚠️ Error Loading Batch Details
            </Heading>
            <Text color="red.700">
              {error || 'Batch not found'}
            </Text>
          </Box>
        </Container>
      </Box>
    );
  }

  const tabs = [
    { id: 'details', title: 'Details' },
    { id: 'transactions', title: 'Transactions' },
  ];

  return (
    <Box minH="100vh" py={6}>
      <Container maxW="container.xl">
        {/* Page Title */}
        <Box mb={6}>
          <Heading size="lg" mb={2}>
            Batch details #{batch.number}
          </Heading>
        </Box>

        {/* Tabs */}
        <Box borderBottom="1px" borderColor="gray.700" mb={0}>
          <Flex gap={0}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'details' | 'transactions')}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  color: activeTab === tab.id ? '#E2E8F0' : '#718096',
                  transition: 'all 0.2s',
                }}
              >
                {tab.title}
              </button>
            ))}
          </Flex>
        </Box>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <Box mt={0}>
            {/* Batch Hash Row */}
            <Flex
              py={4}
              borderBottom="1px"
              borderColor="gray.700"
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 2, md: 0 }}
            >
              <Box w={{ base: '100%', md: '220px' }}>
                <Flex alignItems="center" gap={2}>
                  <Text fontSize="sm" color="gray.400">⬡</Text>
                  <Text fontSize="sm" color="gray.400">Batch Hash</Text>
                </Flex>
              </Box>

              <Flex alignItems="center" gap={2} flex={1} flexWrap="wrap">
                <Text fontSize="sm" fontFamily="mono" wordBreak="break-all">
                  {batch.batchHash}
                </Text>
                <button
                  onClick={() => handleCopy(batch.batchHash)}
                  style={{
                    background: copiedHash === batch.batchHash ? '#48BB78' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: copiedHash === batch.batchHash ? 'white' : '#A0AEC0',
                    borderRadius: '4px',
                  }}
                >
                  {copiedHash === batch.batchHash ? '✓' : <CopyIcon />}
                </button>
              </Flex>
            </Flex>

            {/* Status Row */}
            <Flex
              py={4}
              borderBottom="1px"
              borderColor="gray.700"
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 2, md: 0 }}
            >
              <Box w={{ base: '100%', md: '220px' }}>
                <Flex alignItems="center" gap={2}>
                  <Text fontSize="sm" color="gray.400">⬡</Text>
                  <Text fontSize="sm" color="gray.400">Status and method</Text>
                </Flex>
              </Box>

              <Badge
                colorScheme={batch.status === 'verified' ? 'green' : 'yellow'}
                px={3}
                py={1}
                borderRadius="md"
                fontSize="xs"
                w="fit-content"
              >
                {batch.status || 'Unknown'}
              </Badge>
            </Flex>

            {/* Timestamp Row */}
            <Flex
              py={4}
              borderBottom="1px"
              borderColor="gray.700"
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 2, md: 0 }}
            >
              <Box w={{ base: '100%', md: '220px' }}>
                <Flex alignItems="center" gap={2}>
                  <Text fontSize="sm" color="gray.400">⬡</Text>
                  <Text fontSize="sm" color="gray.400">Timestamp</Text>
                </Flex>
              </Box>

              <Text fontSize="sm">
                {formatTimestamp(batch.timestamp)}
              </Text>
            </Flex>

            {/* Submitter Row */}
            <Flex
              py={4}
              borderBottom="1px"
              borderColor="gray.700"
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 2, md: 0 }}
            >
              <Box w={{ base: '100%', md: '220px' }}>
                <Flex alignItems="center" gap={2}>
                  <Text fontSize="sm" color="gray.400">⬡</Text>
                  <Text fontSize="sm" color="gray.400">Submitter</Text>
                </Flex>
              </Box>

              <Flex alignItems="center" gap={2} flexWrap="wrap">
                <Text fontSize="sm" fontFamily="mono">
                  {batch.submitter || '—'}
                </Text>

                {batch.submitter && (
                  <button
                    onClick={() => handleCopy(batch.submitter!)}
                    style={{
                      background: copiedHash === batch.submitter ? '#48BB78' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      color: copiedHash === batch.submitter ? 'white' : '#A0AEC0',
                      borderRadius: '4px',
                    }}
                  >
                    {copiedHash === batch.submitter ? '✓' : <CopyIcon />}
                  </button>
                )}
              </Flex>
            </Flex>

            {/* Transaction Hash Row */}
            <Flex
              py={4}
              borderBottom="1px"
              borderColor="gray.700"
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 2, md: 0 }}
            >
              <Box w={{ base: '100%', md: '220px' }}>
                <Flex alignItems="center" gap={2}>
                  <Text fontSize="sm" color="gray.400">⬡</Text>
                  <Text fontSize="sm" color="gray.400">Transaction Hash</Text>
                </Flex>
              </Box>

              <Flex alignItems="center" gap={2} flex={1} flexWrap="wrap">
                <Text fontSize="sm" fontFamily="mono" wordBreak="break-all">
                  {batch.txHash}
                </Text>

                <button
                  onClick={() => handleCopy(batch.txHash)}
                  style={{
                    background: copiedHash === batch.txHash ? '#48BB78' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: copiedHash === batch.txHash ? 'white' : '#A0AEC0',
                    borderRadius: '4px',
                  }}
                >
                  {copiedHash === batch.txHash ? '✓' : <CopyIcon />}
                </button>

                <a
                  href={`${SEPOLIA_TX_URL}/${batch.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#A0AEC0',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#CBD5E0')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#A0AEC0')}
                >
                  <ExternalLinkIcon />
                </a>
              </Flex>
            </Flex>

            {/* New State Root Row */}
            <Flex
              py={4}
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 2, md: 0 }}
            >
              <Box w={{ base: '100%', md: '220px' }}>
                <Flex alignItems="center" gap={2}>
                  <Text fontSize="sm" color="gray.400">⬡</Text>
                  <Text fontSize="sm" color="gray.400">New State Root</Text>
                </Flex>
              </Box>

              <Flex alignItems="center" gap={2} flex={1} flexWrap="wrap">
                <Text fontSize="sm" fontFamily="mono" wordBreak="break-all">
                  {batch.newStateRoot}
                </Text>

                <button
                  onClick={() => handleCopy(batch.newStateRoot)}
                  style={{
                    background: copiedHash === batch.newStateRoot ? '#48BB78' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: copiedHash === batch.newStateRoot ? 'white' : '#A0AEC0',
                    borderRadius: '4px',
                  }}
                >
                  {copiedHash === batch.newStateRoot ? '✓' : <CopyIcon />}
                </button>
              </Flex>
            </Flex>
          </Box>
        )}


        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <Box mt={0}>
            {loadingTransactions ? (
              <Flex justifyContent="center" alignItems="center" minH="300px" flexDirection="column" gap={3}>
                <Spinner size="lg" color="blue.500" />
                <Text color="gray.500" fontSize="sm">Loading transactions...</Text>
              </Flex>
            ) : (
              <Box overflowX="auto">
                <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                  <thead style={{ borderBottom: '1px solid #4A5568' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#A0AEC0', fontSize: '0.85rem' }}>Transaction Hash</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#A0AEC0', fontSize: '0.85rem' }}>From</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#A0AEC0', fontSize: '0.85rem' }}>To</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#A0AEC0', fontSize: '0.85rem' }}>Value</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#A0AEC0', fontSize: '0.85rem' }}>Timestamp</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#718096', fontSize: '0.95rem' }}>
                          No transactions found in this batch
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx, index) => (
                        <tr
                          key={tx.hash}
                          style={{
                            borderBottom: index < transactions.length - 1 ? '1px solid #4A5568' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onClick={() => handleTransactionClick(tx.hash)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2D3748';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#63B3ED', fontWeight: '600' }}>
                            {truncateHash(tx.hash, 10, 8)}
                          </td>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#A0AEC0' }}>
                            {truncateHash(tx.from)}
                          </td>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#A0AEC0' }}>
                            {truncateHash(tx.to)}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '600', color: '#E2E8F0' }}>
                            {tx.value} ETH
                          </td>
                          <td style={{ padding: '12px 16px', color: '#A0AEC0' }}>
                            {formatTimestamp(tx.timestamp)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default BatchDetailPage;