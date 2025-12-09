export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export const isPackageManager = (
  pm: string | undefined
): pm is PackageManager => {
  return pm === 'npm' || pm === 'yarn' || pm === 'pnpm';
};

export enum State {
  CachePackageManager = 'CACHE_NODE_PACKAGE_MANAGER',
  CachePrimaryKey = 'CACHE_KEY',
  CacheMatchedKey = 'CACHE_RESULT',
  CachePaths = 'CACHE_PATHS'
}

export enum Outputs {
  CacheHit = 'cache-hit'
}
