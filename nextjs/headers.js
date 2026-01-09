async function headers() {
  const csp = [
    'default-src \'self\'',
    'script-src \'self\' \'unsafe-eval\' \'unsafe-inline\' \'wasm-unsafe-eval\' cdn.jsdelivr.net cdnjs.cloudflare.com',
    'script-src-elem \'self\' \'unsafe-inline\' cdn.jsdelivr.net cdnjs.cloudflare.com',
    'style-src \'self\' \'unsafe-inline\' fonts.gstatic.com fonts.googleapis.com cdn.jsdelivr.net cdnjs.cloudflare.com',
    'img-src \'self\' data: https: blob:',
    'font-src \'self\' fonts.gstatic.com cdn.jsdelivr.net cdnjs.cloudflare.com data:',  
    'worker-src \'self\' blob: data: cdn.jsdelivr.net', 
    'child-src \'self\' blob: data:', 
    [
      'connect-src \'self\'',
      'https://api.anthropic.com',
      'https://prover.nowa.finance',
      'https://apiexplorer.nowa.finance',
      'https://explorer.nowa.finance',
      'wss://apiexplorer.nowa.finance',
      'https://infragrid.v.network',
      'raw.githubusercontent.com',
      'api.github.com',
      'coinzilla.com',
      '*.coinzilla.com',
      'https://request-global.czilladx.com',
      'servedbyadbutler.com',
      '*.slise.xyz',
      'app.specify.sh',
      'https://delegated-ipfs.dev',
      'https://trustless-gateway.link',
      'cdn.jsdelivr.net',
      'cdnjs.cloudflare.com',  
      'static.cloudflareinsights.com',
      'blob:', 
      'data:', 
    ].join(' '),
  ].join('; ');
  
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin-allow-popups', 
        },
        {
          key: 'Cross-Origin-Embedder-Policy',  
          value: 'credentialless',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'Content-Security-Policy',
          value: csp,
        },
      ],
    },
  ];
}
module.exports = headers;