import type { Options } from "../types.js";

export type MiddlewareOptions = {
  pathPrefix?: string;
  log?: Options["log"];
};
