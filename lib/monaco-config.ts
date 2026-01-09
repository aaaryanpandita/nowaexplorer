// lib/monaco-config.ts
if (typeof window !== 'undefined') {
  // Set this BEFORE Monaco loads
  (window as any).MonacoEnvironment = {
    getWorker(_: any, label: string) {
      // Let Monaco use its default CDN workers
      return undefined;
    }
  };
}

export {};