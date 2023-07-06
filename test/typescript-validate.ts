// ************************************************************
// THIS CODE IS NOT EXECUTED. IT IS JUST FOR TYPECHECKING
// ************************************************************

import { Octokit } from "@octokit/core";
import { App } from "../src";

function expect<T>(what: T) {}

export async function CustomOctokitTest() {
  const MyOctokit = Octokit.plugin(() => {
    return {
      foo: "bar",
    };
  });

  const app = new App({
    appId: 1,
    privateKey: "",
    oauth: {
      clientId: "",
      clientSecret: "",
    },
    webhooks: {
      secret: "test",
    },
    Octokit: MyOctokit,
  });

  const appOctokit = await app.getInstallationOctokit(1);
  expect<string>(appOctokit.foo);

  for await (const { octokit } of app.eachInstallation.iterator()) {
    expect<string>(octokit.foo);
  }
  await app.eachInstallation(({ octokit }) => expect<string>(octokit.foo));

  for await (const { octokit } of app.eachRepository.iterator()) {
    expect<string>(octokit.foo);
  }
  await app.eachRepository(({ octokit }) => expect<string>(octokit.foo));

  for await (const { octokit } of app.eachRepository.iterator({
    installationId: 1,
  })) {
    expect<string>(octokit.foo);
  }
  await app.eachRepository({ installationId: 1 }, ({ octokit }) =>
    expect<string>(octokit.foo),
  );

  app.webhooks.on("push", ({ octokit }) => {
    expect<string>(octokit.foo);
  });

  expect<string>(app.oauth.octokit.foo);

  app.oauth.on("token.created", ({ octokit }) => {
    expect<string>(octokit.foo);
  });
}

export async function CustomOctokitFromDefaultsTest() {
  const MyOctokit = Octokit.plugin(() => {
    return {
      foo: "bar",
    };
  });

  const MyApp = App.defaults({
    Octokit: MyOctokit,
  });

  const app = new MyApp({
    appId: 1,
    privateKey: "",
    oauth: {
      clientId: "",
      clientSecret: "",
    },
    webhooks: {
      secret: "test",
    },
  });

  expect<string>(app.octokit.foo);
  expect<string>(app.oauth.octokit.foo);
}
