import LRU = require("lru-cache");

declare interface AppOptions {
  id: string
  privateKey: string
  baseUrl?: string
  cache?: LRU.Cache<string, string>
}
declare interface getJWTOptions {
  installation_id: string
}

declare interface getInstallationAccessTokenOptions {
  installation_id: string
}

// Not really a class, but it is how they say it should be used in the readme.
// In TypeScript, you cannot use the `new` keyword on functions (excluding old-style classes using functions and prototype), only on classes
declare class App {
  constructor(options: AppOptions)
  getSignedJsonWebToken(options?: getJWTOptions): string
  getInstallationAccessToken(options?: getInstallationAccessTokenOptions): Promise<string>
}

export = App;
