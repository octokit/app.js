import LRUCache from "lru-cache";
import { request } from "@octokit/request";

export interface State {
  id: number;
  privateKey: string;
  request: typeof request;
  cache:
    | LRUCache<number, string>
    | {
        get: (key: number) => string;
        set: (key: number, value: string) => any;
      };
}