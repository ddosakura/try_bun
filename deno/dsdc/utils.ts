import {
  $,
  createSingletonPromise,
  deepMerge,
  type DockerComposeSchema,
  join,
  toml,
  yaml,
} from "./deps.ts";

const initDockerCompose = createSingletonPromise(async () => {
  // [DisposableStack is not implemented](https://github.com/denoland/deno/issues/20821)
  // $.setPrintCommand(false);
  // using cleanup = new DisposableStack();
  // cleanup.defer(() => $.setPrintCommand(true));

  if (!await $.commandExists("docker")) {
    console.error("docker not found!");
    Deno.exit(-1);
  }

  try {
    await $`docker compose version`;
    return "docker compose";
    // deno-lint-ignore no-empty
  } catch {
  }

  if (!await $.commandExists("docker-compose")) {
    console.error("docker-compose not found!");
    Deno.exit(-1);
  }
  return "docker-compose";
});

export async function runDockerCompose(cmd: string) {
  return $.raw`${await initDockerCompose()} ${cmd}`;
}

function sortKeyWeight(k: string): string {
  if (["version"].includes(k)) return `_${k}`;
  return k;
}

function sortRecord<T extends Record<string, unknown>>(r: T): T {
  const keys = Object.keys(r);
  const entries = keys
    .sort((a, b) => {
      if (sortKeyWeight(a) > sortKeyWeight(b)) return 1;
      return -1;
    })
    .map((key) => {
      const value = r[key];
      if (Array.isArray(value)) return [key, value];
      if (value && typeof value === "object") {
        return [key, sortRecord(value as Record<string, unknown>)];
      }
      return [key, value];
    });
  return Object.fromEntries(entries);
}

export async function fmtToml(path: string) {
  try {
    const text = await Deno.readTextFile(path);
    const data = sortRecord(toml.parse(text));
    await Deno.writeTextFile(path, toml.stringify(data));
    // deno-lint-ignore no-empty
  } catch {
  }
}

export async function fmtYaml(path: string) {
  try {
    const text = await Deno.readTextFile(path);
    const data = sortRecord(yaml.parse(text) as Record<string, unknown>);
    await Deno.writeTextFile(path, yaml.stringify(data));
    // deno-lint-ignore no-empty
  } catch {
  }
}

export async function readTextFile(path: string) {
  try {
    return await Deno.readTextFile(path);
  } catch {
    return "";
  }
}

// deno-lint-ignore no-explicit-any
export async function merge<T extends Record<any, any>>(
  base: T,
  // deno-lint-ignore no-explicit-any
  ...list: any[]
) {
  let result = base;
  for (const item of list) {
    if (!item) continue;
    try {
      result = deepMerge<T>(
        result,
        await (typeof item === "function" ? item() : item),
      );
      // deno-lint-ignore no-empty
    } catch {
    }
  }
  return sortRecord(result);
}

export interface DSDCConfig {
  compose: {
    version: number | string;
  };
  store: {
    path: string;
  };
  remote: {
    name: string;
    repo: string;
  }[];
}

export const CLI_NAME = "dsdc";

export const HOME_DIR = Deno.env.get("HOME");

export const GLOBAL_CONFIG_PATH = HOME_DIR
  ? join(HOME_DIR, `.${CLI_NAME}.toml`)
  : "";

export function loadConfig(path: string) {
  return merge<DSDCConfig>({
    compose: {
      version: 3.8,
    },
    store: {
      path: HOME_DIR
        ? join(HOME_DIR, `.cache/${CLI_NAME}`)
        : join(Deno.cwd(), `.${CLI_NAME}`),
    },
    remote: [],
  }, async () => {
    return toml.parse(await readTextFile(GLOBAL_CONFIG_PATH));
  }, async () => {
    return toml.parse(await readTextFile(path));
  });
}

export async function loadEnv(path: string) {
  try {
    return toml.parse(await readTextFile(path));
  } catch {
    return {};
  }
}

export async function loadDockerCompose(path: string) {
  try {
    const text = await Deno.readTextFile(path);
    return yaml.parse(text) as DockerComposeSchema ?? {};
  } catch {
    return {};
  }
}
