import {
  Box,
  Heading,
  Text,
  Badge,
  Spinner,
  Button,
  Flex,
  HStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { getBatchesPaginated, type ProverBatch } from '../types/api/batch';
import { SEPOLIA_TX_URL } from '../types/api/tx';

// Simple Copy Icon Component
const CopyIconSVG = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

// Simple External Link Icon Component
const ExternalLinkIconSVG = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const PropertyBatchesPage = () => {
  const [batches, setBatches] = useState<ProverBatch[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalBatches, setTotalBatches] = useState<number>(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

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

  const handleCopy = async (text: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation when copying
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(text);
      setTimeout(() => setCopiedHash(null), 1500);
    } catch (error) {
      console.error('Copy failed:', error);
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedHash(text);
        setTimeout(() => setCopiedHash(null), 1500);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleBatchClick = (batchNumber: number) => {
    window.location.href = `/batches/${batchNumber}`;
  };

  const fetchBatches = async (page: number, limit: number) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching batches: page=${page}, limit=${limit}`);

      const data = await getBatchesPaginated(page, limit);

      console.log('API Response:', data);

      setBatches(data.batches);
      setTotalBatches(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch batches');
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(`useEffect triggered: currentPage=${currentPage}, itemsPerPage=${itemsPerPage}`);
    fetchBatches(currentPage, itemsPerPage);

    const interval = setInterval(() => {
      fetchBatches(currentPage, itemsPerPage);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    console.log(`Changing items per page to: ${newItemsPerPage}`);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading && batches.length === 0) {
    return (
      <Box px={6} py={6} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box px={6} py={6}>
        <Box
          bg="red.50"
          borderWidth="1px"
          borderColor="red.200"
          borderRadius="md"
          p={4}
        >
          <Heading size="sm" color="red.800" mb={2}>
            Error Loading Batches
          </Heading>
          <Text color="red.700" fontSize="sm">
            {error}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box px={6} py={6}>
      <Heading size="md" mb={1}>
        Property Batches
      </Heading>
      <Text color="text.secondary" mb={6}>
        Batch-wise property data on NOWA chain
      </Text>

      <Box
        bg="bg.primary"
        borderWidth="1px"
        borderColor="border.divider"
        borderRadius="lg"
        overflowX="auto"
      >
        <table style={{ width: '100%', fontSize: '0.875rem' }}>
          <thead style={{ backgroundColor: 'var(--chakra-colors-bg-secondary)' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Batch #</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Batch Hash</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Transaction Hash</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>New State Root</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Submitter</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>

          <tbody>
            {batches.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--chakra-colors-text-secondary)' }}>
                  No batches found
                </td>
              </tr>
            ) : (
              batches.map((batch) => (
                <tr
                  key={batch.number}
                  style={{
                    borderBottom: '1px solid var(--chakra-colors-border-divider)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onClick={() => handleBatchClick(batch.number)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--chakra-colors-bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 600, color: '#3182CE' }}>
                    {batch.number}
                  </td>

                  {/* Batch Hash Column */}
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                    <Flex alignItems="center" gap={2}>
                      <Text color="#3182CE">{truncateHash(batch.batchHash)}</Text>
                      <Box position="relative" display="inline-block">
                        <button
                          onClick={(e) => handleCopy(batch.batchHash, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.6,
                            transition: 'opacity 0.2s',
                            color: copiedHash === batch.batchHash ? '#48BB78' : 'inherit',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                        >
                          {copiedHash === batch.batchHash ? (
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                          ) : (
                            <CopyIconSVG />
                          )}
                        </button>
                        {copiedHash === batch.batchHash && (
                          <Box
                            position="absolute"
                            top="-30px"
                            left="50%"
                            transform="translateX(-50%)"
                            bg="gray.800"
                            color="white"
                            px={2}
                            py={1}
                            borderRadius="md"
                            fontSize="xs"
                            whiteSpace="nowrap"
                            zIndex={10}
                          >
                            Copied!
                          </Box>
                        )}
                      </Box>
                    </Flex>
                  </td>

                  {/* Transaction Hash Column */}
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                    <Flex alignItems="center" gap={2}>
                      <Text>{truncateHash(batch.txHash)}</Text>
                      <Box position="relative" display="inline-block">
                        <button
                          onClick={(e) => handleCopy(batch.txHash, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.6,
                            transition: 'opacity 0.2s',
                            color: copiedHash === batch.txHash ? '#48BB78' : 'inherit',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                        >
                          {copiedHash === batch.txHash ? (
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                          ) : (
                            <CopyIconSVG />
                          )}
                        </button>
                        {copiedHash === batch.txHash && (
                          <Box
                            position="absolute"
                            top="-30px"
                            left="50%"
                            transform="translateX(-50%)"
                            bg="gray.800"
                            color="white"
                            px={2}
                            py={1}
                            borderRadius="md"
                            fontSize="xs"
                            whiteSpace="nowrap"
                            zIndex={10}
                          >
                            Copied!
                          </Box>
                        )}
                      </Box>
                      <a
                        href={`${SEPOLIA_TX_URL}/${batch.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px',
                          opacity: 0.6,
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                      >
                        <ExternalLinkIconSVG />
                      </a>
                    </Flex>
                  </td>

                  <td style={{ padding: '12px' }}>
                    {formatTimestamp(batch.timestamp)}
                  </td>

                  {/* New State Root Column */}
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                    <Flex alignItems="center" gap={2}>
                      <Text>{truncateHash(batch.newStateRoot)}</Text>
                      <Box position="relative" display="inline-block">
                        <button
                          onClick={(e) => handleCopy(batch.newStateRoot, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.6,
                            transition: 'opacity 0.2s',
                            color: copiedHash === batch.newStateRoot ? '#48BB78' : 'inherit',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                        >
                          {copiedHash === batch.newStateRoot ? (
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                          ) : (
                            <CopyIconSVG />
                          )}
                        </button>
                        {copiedHash === batch.newStateRoot && (
                          <Box
                            position="absolute"
                            top="-30px"
                            left="50%"
                            transform="translateX(-50%)"
                            bg="gray.800"
                            color="white"
                            px={2}
                            py={1}
                            borderRadius="md"
                            fontSize="xs"
                            whiteSpace="nowrap"
                            zIndex={10}
                          >
                            Copied!
                          </Box>
                        )}
                      </Box>
                    </Flex>
                  </td>

                  {/* Submitter Column */}
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                    {batch.submitter ? (
                      <Flex alignItems="center" gap={2}>
                        <Text>{truncateHash(batch.submitter)}</Text>
                        <Box position="relative" display="inline-block">
                          <button
                            onClick={(e) => batch.submitter && handleCopy(batch.submitter, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              opacity: 0.6,
                              transition: 'opacity 0.2s',
                              color: copiedHash === batch.submitter ? '#48BB78' : 'inherit',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                          >
                            {copiedHash === batch.submitter ? (
                              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                            ) : (
                              <CopyIconSVG />
                            )}
                          </button>
                          {copiedHash === batch.submitter && (
                            <Box
                              position="absolute"
                              top="-30px"
                              left="50%"
                              transform="translateX(-50%)"
                              bg="gray.800"
                              color="white"
                              px={2}
                              py={1}
                              borderRadius="md"
                              fontSize="xs"
                              whiteSpace="nowrap"
                              zIndex={10}
                            >
                              Copied!
                            </Box>
                          )}
                        </Box>
                      </Flex>
                    ) : (
                      '-'
                    )}
                  </td>

                  <td style={{ padding: '12px' }}>
                    <Badge
                      colorScheme={batch.status}
                      variant="subtle"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {batch.status || 'Unknown'}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>

      {/* Pagination Controls - Etherscan Style */}
      {totalPages > 0 && (
        <Box mt={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={4}
            direction={{ base: 'column', md: 'row' }}   // ✅ stack on mobile
          >
            {/* Left side - Show rows selector */}
            <Flex
              alignItems="center"
              gap={2}
              w={{ base: '100%', md: 'auto' }}          // ✅ full width on mobile
              justify={{ base: 'center', md: 'flex-start' }}
              flexWrap="wrap"
            >
              <Text fontSize="sm" color="text.secondary">
                Show
              </Text>

              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  borderWidth: '1px',
                  borderColor: 'var(--chakra-colors-border-divider)',
                  backgroundColor: 'var(--chakra-colors-bg-primary)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>

              <Text fontSize="sm" color="text.secondary">
                Records
              </Text>
            </Flex>

            {/* Right side - Page navigation */}
            <HStack
              gap={1}
              flexWrap="wrap"                           // ✅ wrap pagination buttons
              justify="center"
              w={{ base: '100%', md: 'auto' }}          // ✅ center on mobile
            >
              <Button
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 1 || loading}
                variant="outline"
                borderColor="border.divider"
              >
                Previous
              </Button>

              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <Text key={`ellipsis-${index}`} px={2} color="text.secondary">
                      ...
                    </Text>
                  );
                }

                const pageNum = page as number;
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    variant={currentPage === pageNum ? 'solid' : 'outline'}
                    colorScheme={currentPage === pageNum ? 'blue' : undefined}
                    borderColor="border.divider"
                    disabled={loading}
                    minW="36px"                          // ✅ tap friendly
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                size="sm"
                onClick={nextPage}
                disabled={currentPage >= totalPages || loading}
                variant="outline"
                borderColor="border.divider"
              >
                Next
              </Button>
            </HStack>
          </Flex>

          {/* Page info below pagination */}
          <Text
            fontSize="xs"
            color="text.secondary"
            mt={3}
            textAlign="center"
            px={2}                                     // ✅ avoid text overflow
          >
            Page {currentPage} of {totalPages} | Total Batches: {totalBatches} | Showing: {batches.length} records
          </Text>
        </Box>
      )}

    </Box>
  );
};

export default PropertyBatchesPage;