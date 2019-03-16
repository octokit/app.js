import LRUCache = require("lru-cache");

declare interface AppOptions {
  id: string
  privateKey: string
  baseUrl?: string
  cache?: LRUCache<string, string>
}

declare interface getInstallationAccessTokenOptions {
  installationId: number
}

// Not really a class, but it is how they say it should be used in the readme.
// In TypeScript, you cannot use the `new` keyword on functions (excluding old-style classes using functions and prototype), only on classes
declare class App {
  constructor(options: AppOptions)
  public getSignedJsonWebToken(): string
  public getInstallationAccessToken(options?: getInstallationAccessTokenOptions): Promise<string>
}

export = App;
