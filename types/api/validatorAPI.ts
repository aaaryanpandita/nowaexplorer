// lib/api/validatorApi.ts
export interface Validator {
  operator_address: string;
  consensus_pubkey: {
    '@type': string;
    key: string;
  };
  jailed: boolean;
  status: string;
  tokens: string;
  delegator_shares: string;
  description: {
    moniker: string;
    identity: string;
    website: string;
    security_contact: string;
    details: string;
  };
  unbonding_height: string;
  unbonding_time: string;
  commission: {
    commission_rates: {
      rate: string;
      max_rate: string;
      max_change_rate: string;
    };
    update_time: string;
  };
  min_self_delegation: string;
}

export interface ValidatorsResponse {
  validators: Validator[];
  pagination: {
    next_key: string | null;
    total: string;
  };
}

// ✅ Use Next.js API route instead of direct API call
const BASE_URL = '/api';

class ValidatorAPI {
  /**
   * Fetch validators with pagination
   * @param limit - Number of validators per page (default: 10)
   * @param paginationKey - Key for next page (optional)
   */
  async getValidators(
    limit: number = 10,
    paginationKey: string | null = null
  ): Promise<ValidatorsResponse> {
    try {
      // ✅ Call Next.js API route instead of external API
      let url = `${BASE_URL}/validators?limit=${limit}`;
      
      if (paginationKey) {
        url += `&key=${encodeURIComponent(paginationKey)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as ValidatorsResponse;
      return data;
    } catch (error) {
      console.error('Error fetching validators:', error);
      throw error;
    }
  }

  /**
   * Get single validator by operator address
   * @param operatorAddress - Validator operator address
   */
  async getValidator(operatorAddress: string): Promise<{ validator: Validator }> {
    try {
      const url = `${BASE_URL}/validator/${operatorAddress}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as { validator: Validator };
      return data;
    } catch (error) {
      console.error('Error fetching validator:', error);
      throw error;
    }
  }

  /**
   * Get validator delegations
   * @param operatorAddress - Validator operator address
   */
  async getValidatorDelegations(
    operatorAddress: string,
    limit: number = 10,
    paginationKey: string | null = null
  ): Promise<any> {
    try {
      let url = `${BASE_URL}/validator/${operatorAddress}/delegations?limit=${limit}`;
      
      if (paginationKey) {
        url += `&key=${encodeURIComponent(paginationKey)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as any;
      return data;
    } catch (error) {
      console.error('Error fetching validator delegations:', error);
      throw error;
    }
  }

  /**
   * Format tokens from string to readable number
   * @param tokens - Token amount as string
   */
  formatTokens(tokens: string): string {
    const num = parseFloat(tokens) / 1e18;
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    });
  }

  /**
   * Shorten address for display
   * @param address - Full address
   */
  shortenAddress(address: string, start: number = 12, end: number = 8): string {
    if (!address) return '';
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  }

  /**
   * Get validator status label
   * @param status - Validator status
   */
  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      'BOND_STATUS_BONDED': 'Active',
      'BOND_STATUS_UNBONDING': 'Unbonding',
      'BOND_STATUS_UNBONDED': 'Unbonded',
    };
    return statusMap[status] || status;
  }

  /**
   * Calculate commission percentage
   * @param rate - Commission rate string
   */
  getCommissionPercentage(rate: string): string {
    const num = parseFloat(rate) * 100;
    return `${num.toFixed(2)}%`;
  }
}

// Export singleton instance
export const validatorAPI = new ValidatorAPI();

// Export default
export default validatorAPI;