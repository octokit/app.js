import { Octokit as OctokitCore, type OctokitOptions } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";
import { OAuthApp } from "@octokit/oauth-app";
import type { Webhooks } from "@octokit/webhooks";

import type {
  Options,
  ConstructorOptions,
  EachInstallationInterface,
  EachRepositoryInterface,
  GetInstallationOctokitInterface,
  GetInstallationUrlInterface,
} from "./types.js";

// Export types required for the App class
// This is in order to fix a TypeScript error in downstream projects:
// The inferred type of 'App' cannot be named without a reference to '../node_modules/@octokit/app/dist-types/types.js'. This is likely not portable. A type annotation is necessary.
export type {
  EachInstallationInterface,
  EachRepositoryInterface,
  GetInstallationOctokitInterface,
  GetInstallationUrlInterface,
} from "./types.js";

import { VERSION } from "./version.js";
import { webhooks } from "./webhooks.js";
import { eachInstallationFactory } from "./each-installation.js";
import { eachRepositoryFactory } from "./each-repository.js";
import { getInstallationOctokit } from "./get-installation-octokit.js";
import { getInstallationUrlFactory } from "./get-installation-url.js";

type Constructor<T> = new (...args: any[]) => T;

type OctokitType<TOptions extends Options> =
  TOptions["Octokit"] extends typeof OctokitCore
    ? InstanceType<TOptions["Octokit"]>
    : OctokitCore;

type OctokitClassType<TOptions extends Options> =
  TOptions["Octokit"] extends typeof OctokitCore
    ? TOptions["Octokit"]
    : typeof OctokitCore;

export class App<TOptions extends Options = Options> {
  static VERSION = VERSION;

  static defaults<
    TDefaults extends Options,
    S extends Constructor<App<TDefaults>>,
  >(this: S, defaults: Partial<TDefaults>) {
    const AppWithDefaults = class extends this {
      constructor(...args: any[]) {
        super({
          ...defaults,
          ...args[0],
        });
      }
    };

    return AppWithDefaults as typeof AppWithDefaults & typeof this;
  }

  octokit: OctokitType<TOptions>;
  // @ts-ignore calling app.webhooks will throw a helpful error when options.webhooks is not set
  webhooks: Webhooks<{ octokit: OctokitType<TOptions> }>;
  // @ts-ignore calling app.oauth will throw a helpful error when options.oauth is not set
  oauth: OAuthApp<{
    clientType: "github-app";
    Octokit: OctokitClassType<TOptions>;
  }>;
  getInstallationOctokit: GetInstallationOctokitInterface<
    OctokitType<TOptions>
  >;
  eachInstallation: EachInstallationInterface<OctokitType<TOptions>>;
  eachRepository: EachRepositoryInterface<OctokitType<TOptions>>;
  getInstallationUrl: GetInstallationUrlInterface;
  log: {
    debug: (message: string, additionalInfo?: object) => void;
    info: (message: string, additionalInfo?: object) => void;
    warn: (message: string, additionalInfo?: object) => void;
    error: (message: string, additionalInfo?: object) => void;
    [key: string]: unknown;
  };

  constructor(options: ConstructorOptions<TOptions>) {
    const Octokit = (options.Octokit ||
      OctokitCore) as OctokitClassType<TOptions>;

    const authOptions = Object.assign(
      {
        appId: options.appId,
        privateKey: options.privateKey,
      },
      options.oauth
        ? {
            clientId: options.oauth.clientId,
            clientSecret: options.oauth.clientSecret,
          }
        : {},
    );

    const octokitOptions: OctokitOptions = {
      authStrategy: createAppAuth,
      auth: authOptions,
    };

    if ("log" in options && typeof options.log !== "undefined") {
      octokitOptions.log = options.log;
    }

    this.octokit = new Octokit(octokitOptions) as OctokitType<TOptions>;

    this.log = Object.assign(
      {
        debug: () => {},
        info: () => {},
        warn: console.warn.bind(console),
        error: console.error.bind(console),
      },
      options.log,
    );

    // set app.webhooks depending on whether "webhooks" option has been passed
    if (options.webhooks) {
      // @ts-expect-error TODO: figure this out
      this.webhooks = webhooks(this.octokit, options.webhooks);
    } else {
      Object.defineProperty(this, "webhooks", {
        get() {
          throw new Error("[@octokit/app] webhooks option not set");
        },
      });
    }

    // set app.oauth depending on whether "oauth" option has been passed
    if (options.oauth) {
      this.oauth = new OAuthApp({
        ...options.oauth,
        clientType: "github-app",
        Octokit,
      });
    } else {
      Object.defineProperty(this, "oauth", {
        get() {
          throw new Error(
            "[@octokit/app] oauth.clientId / oauth.clientSecret options are not set",
          );
        },
      });
    }

    this.getInstallationOctokit = getInstallationOctokit.bind(
      null,
      this,
    ) as GetInstallationOctokitInterface<OctokitType<TOptions>>;
    this.eachInstallation = eachInstallationFactory(
      this,
    ) as EachInstallationInterface<OctokitType<TOptions>>;
    this.eachRepository = eachRepositoryFactory(
      this,
    ) as EachRepositoryInterface<OctokitType<TOptions>>;
    this.getInstallationUrl = getInstallationUrlFactory(this);
  }
}

export { createNodeMiddleware } from "./middleware/node/index.js";
