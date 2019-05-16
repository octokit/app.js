import LRUCache from "lru-cache";
import { request } from "@octokit/request";

export interface State {
  id: number;
  privateKey: string;
  request: typeof request;
  cache: LRUCache<string, string>;
}
