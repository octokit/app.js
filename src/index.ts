import { request } from '@octokit/request'

import { getCache } from './get-cache'
import { getInstallationAccessToken } from './get-installation-access-token'
import { getSignedJsonWebToken } from './get-signed-json-web-token'
import LRUCache from 'lru-cache';

interface AppOptions {
  id: number
  privateKey: string
  baseUrl?: string
  cache?: LRUCache<string, string>
}

export class App {
  private state: {
    id: number
    privateKey: string
    cache: LRUCache<string, string>
    request: typeof request
  };

  constructor({ id, privateKey, baseUrl, cache }: AppOptions) {
    this.state = {
      id,
      privateKey,
      request: baseUrl ? request.defaults({ baseUrl }) : request,
      cache: cache || getCache()
    }
  }
  getSignedJsonWebToken(): string {
    return getSignedJsonWebToken.bind(null, this.state)();
  }

  getInstallationAccessToken(options: { installationId: number }) {
    return getInstallationAccessToken.bind(null, this.state)(options)
  }
}

