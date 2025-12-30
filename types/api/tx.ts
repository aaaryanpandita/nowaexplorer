export const SEPOLIA_TX_URL = "https://sepolia.etherscan.io/tx"

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

export default copyToClipboard;