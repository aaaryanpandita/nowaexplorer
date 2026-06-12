// Manual icon overrides for tokens whose backend icon_url is missing/incorrect.
// Keys MUST be lowercase contract addresses.
const CUSTOM_TOKEN_ICONS: Record<string, string> = {
  '0x4c3350f8c0877d575e985035285bfc16d78ed118': 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/smartchain/assets/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c/logo.png', // WBNB
  '0x236169c904383198a959bcecd31c932acc2a9f30': 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png', // WBTC
  '0x3d799857f6df4c926cefc17a93ac96b04b158875': 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png', // WETH
  '0x182a1a7497b1debfbeac9e09d38542d2335397df': 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xD31a59c85aE9D8edEFeC411D448f90841571b89c/logo.png', // WSOL
  '0x67c518934161960aec84bf5a48f96a6906eaf798': 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/tron/info/logo.png', // TRX
  '0xde57fab507044aefbdc4ac07c176327e827995d0': 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png', // USDC
  '0x1e9780fdd0db61ddb0c71c8235b24703cac2f305': 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png', // USDT
  '0x6c025296c9901904099c353ce2a08d0b7baf5fa4': 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ripple/info/logo.png', // XRP
  '0x5257bdd1f82de2b5906e83bdb87776dba7dbda97': '/nowa.svg', // NUSC
};

export default CUSTOM_TOKEN_ICONS;
