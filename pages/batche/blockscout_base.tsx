import React from 'react';

const BLOCKSCOUT_BASE_URL = 'http://apiexplorer.nowa.finance/api'; // Change to your Blockscout API URL

export default function BlockscoutBasePage() {
  return (
    <div>
      <h1>Blockscout Base API</h1>
      <p>The Blockscout Base API is set to: { BLOCKSCOUT_BASE_URL }</p>
    </div>
  );
}

// Export the constant if other files need to import it
export { BLOCKSCOUT_BASE_URL };
