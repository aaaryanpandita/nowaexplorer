import React, { useEffect, useState } from 'react';
import validatorAPI, { type Validator } from 'types/api/validatorAPI';

const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

const ValidatorPage = () => {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextKey, setNextKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const isDark = useIsDarkMode();

  const c = {
    headingColor: isDark ? '#fff' : '#1a1a1a',
    tableBg:      isDark ? '#0d0d0d' : '#ffffff',
    theadBg:      isDark ? '#1a1a1a' : '#f5f5f5',
    thColor:      isDark ? '#aaa' : '#444',
    rowBorder:    isDark ? '#1a1a1a' : '#e8e8e8',
    addressColor: isDark ? '#888' : '#666',
    valueColor:   isDark ? '#fff' : '#111',
    spinnerBorder:isDark ? '#333' : '#ddd',
    spinnerTop:   isDark ? '#fff' : '#333',
    loadingText:  isDark ? '#888' : '#666',
  };

  const fetchValidators = async (paginationKey: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await validatorAPI.getValidators(itemsPerPage, paginationKey);
      setValidators(data.validators || []);
      setNextKey(data.pagination?.next_key || null);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch validators. Please try again.');
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchValidators();
  }, []);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const formatToEther = (wei: string): string => {
    const ether = parseFloat(wei) / 1e18;
    return ether.toLocaleString(undefined, { 
      maximumFractionDigits: 6,
      minimumFractionDigits: 0 
    });
  };

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '100%', width: '100%' }}>
        <div style={{
          backgroundColor: '#1a0000',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#ff6b6b', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `4px solid ${c.spinnerBorder}`,
          borderTop: `4px solid ${c.spinnerTop}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: c.loadingText, marginTop: '20px', fontSize: '14px' }}>
          Loading validators...
        </p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '16px',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '30px',
          marginBottom: '8px',
          color: c.headingColor,
          fontWeight: '800'
        }}>
          Validators
        </h2>
      </div>

      <div style={{
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        marginBottom: '20px'
      }}>
        <table style={{ 
          width: '100%',
          minWidth: '600px',
          borderCollapse: 'collapse',
          backgroundColor: c.tableBg,
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ backgroundColor: c.theadBg, textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: c.thColor }}>
                Operator Address
              </th>
              <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right', color: c.thColor }}>
                Total Stake (NOWA)
              </th>
            </tr>
          </thead>
          <tbody>
            {validators.map((validator) => (
              <tr 
                key={validator.operator_address}
                style={{ borderBottom: `1px solid ${c.rowBorder}` }}
              >
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    color: c.addressColor,
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}>
                    {validator.operator_address}
                  </span>
                </td>
                <td style={{ 
                  padding: '12px 16px',
                  textAlign: 'right',
                  color: c.valueColor,
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap'
                }}>
                  {formatToEther(validator.tokens)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {/* <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
        fontSize: '14px',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 16px',
            backgroundColor: currentPage === 1 ? '#111' : '#1a1a1a',
            color: currentPage === 1 ? '#555' : '#888',
            border: '1px solid #333',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            minWidth: '90px'
          }}
        >
          Previous
        </button>
        <span style={{ color: '#888', padding: '0 8px' }}>
          Page {currentPage}
        </span>
        <button 
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={!nextKey}
          style={{
            padding: '8px 16px',
            backgroundColor: nextKey ? '#1a1a1a' : '#111',
            color: nextKey ? '#888' : '#555',
            border: '1px solid #333',
            borderRadius: '4px',
            cursor: nextKey ? 'pointer' : 'not-allowed',
            minWidth: '90px'
          }}
        >
          Next
        </button>
      </div> */}
    </div>
  );
};

export default ValidatorPage;