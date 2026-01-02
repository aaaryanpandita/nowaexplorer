async function headers() {
  const csp = [
    'default-src \'self\'',
    'script-src \'self\' \'unsafe-eval\' \'unsafe-inline\'',
    'style-src \'self\' \'unsafe-inline\' fonts.gstatic.com',
    'img-src \'self\' data: https:',
    'font-src \'self\' fonts.gstatic.com',
    [
      'connect-src \'self\'',
      'https://prover.nowa.finance',
      'https://apiexplorer.nowa.finance',
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
          value: 'same-origin',
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
