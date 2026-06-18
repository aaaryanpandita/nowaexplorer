const API_BASE = 'https://api-nowatoken.tarality.io/api/v1';

const iconCache = new Map<string, string | null>();

export async function getTokenIconUrl(tokenAddress: string): Promise<string | null> {
  const address = tokenAddress.toLowerCase();

  if (iconCache.has(address)) {
    return iconCache.get(address) ?? null;
  }

  try {
    const res = await fetch(`${API_BASE}/token/getTokenInfo/${address}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      iconCache.set(address, null);
      return null;
    }

    const json = await res.json() as { status: boolean; data: { logoUrl: string } };
    const logoUrl: string | null = json?.data?.logoUrl ?? null;

    iconCache.set(address, logoUrl);
    return logoUrl;
  } catch {
    iconCache.set(address, null);
    return null;
  }
}