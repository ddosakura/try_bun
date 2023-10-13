import {
  $,
  basename,
  createSingletonPromise,
  diff,
  join,
  yaml,
} from "./deps.ts";
import {
  CLI_NAME,
  fmtToml,
  fmtYaml,
  GLOBAL_CONFIG_PATH,
  HOME_DIR,
  loadConfig,
  loadDockerCompose,
  loadEnv,
  merge,
  readTextFile,
  runDockerCompose,
} from "./utils.ts";

$.setPrintCommand(true);

// 鉴于 flags 不是稳定模块，先放这边
// https://github.com/denoland/deno_std/issues/3489#issuecomment-1702521412
import { parse } from "https://deno.land/std@0.203.0/flags/mod.ts";

const {
  _: [subCommand = "", ...args],
  ...flags
} = parse(Deno.args, {
  boolean: ["help"],
  string: ["config", "template", "projectName"],
  alias: {
    help: "h",
    config: "c",
    template: ["t", "tpl"],
    projectName: "p",
  },
  default: {
    config: `${CLI_NAME}.toml`,
  },
});

const load = createSingletonPromise(() => loadConfig(flags.config));
const config = await load();

const DSDC_DIR = join(Deno.cwd(), config.store.path);
const TEMPLATE_DIR = join(DSDC_DIR, "templates");
const SERVICE_DIR = join(DSDC_DIR, "services");

function parseProject(name = "") {
  const projectName = flags.projectName ?? String(name);
  if (projectName !== basename(projectName)) {
    console.error("Illegal Project Name:", projectName);
    Deno.exit(-1);
  }
  const projectPath = join(DSDC_DIR, "projects", projectName);
  return {
    projectName,
    projectPath,
  };
}

function run(
  commands: Record<
    string,
    (...args: string[]) => void | Promise<void>
  >,
  cmd: string,
  ...args: string[]
) {
  return commands[cmd]?.(...args);
}

await run(
  {
    /** dsdc diff */
    async diff(a, b) {
      console.log(
        "=== diff start ===\n",
        diff(
          await readTextFile(a),
          await readTextFile(b),
        ),
        "\n=== diff end ===\n",
      );
    },
    /** dsdc fmt */
    async fmt(rawPath) {
      const path = rawPath || flags.config || GLOBAL_CONFIG_PATH;
      console.log("FORMAT", path);
      await (path.endsWith(".toml") ? fmtToml : fmtYaml)(path);
    },
    /** dsdc info */
    info(rawProjectName) {
      console.log("HOME_DIR:", HOME_DIR);
      console.log("GLOBAL_CONFIG_PATH:", GLOBAL_CONFIG_PATH);
      console.log("DSDC_DIR:", DSDC_DIR);
      console.log("SERVICE_DIR:", SERVICE_DIR);
      console.log("TEMPLATE_DIR:", TEMPLATE_DIR);
      const { projectName, projectPath } = parseProject(rawProjectName);
      if (projectName) {
        console.log("Project Name:", projectName);
        console.log("Project Path:", projectPath);
      }
    },
    /** dsdc g/gen */
    async g(rawProjectName) {
      const { projectPath } = parseProject(rawProjectName);
      if (!projectPath) {
        console.error("no project path!");
        Deno.exit(-1);
      }
      const envPath = `${projectPath}/.env`;
      const basecfgPath = `${projectPath}/docker-compose.yml`;
      const overridePath = `${projectPath}/docker-compose.override.yml`;
      const env = await loadEnv(envPath);
      const basecfg = await loadDockerCompose(basecfgPath);
      const override = await loadDockerCompose(overridePath);
      const cfg = await merge({
        version: config.compose.version,
      }, basecfg);

      console.log([env, basecfg, override, cfg]);
      console.log(
        "=== diff start ===\n",
        diff(
          yaml.stringify(basecfg),
          yaml.stringify(cfg),
        ),
        "\n=== diff end ===\n",
      );
      await Deno.writeTextFile(
        basecfgPath.replace(".yml", ".tmp.yml"),
        yaml.stringify(cfg),
      );
    },
    /** dsdc config */
    config(rawProjectName) {
      const { projectPath } = parseProject(rawProjectName);
      $.cd(projectPath);
      // runDockerCompose(`-p ${projectName} config`);
      runDockerCompose(`config`);
    },
    /** dsdc up */
    up(rawProjectName) {
      const { projectPath } = parseProject(rawProjectName);
      $.cd(projectPath);
      runDockerCompose("up -d");
    },
    /** dsdc down */
    down(rawProjectName) {
      const { projectPath } = parseProject(rawProjectName);
      $.cd(projectPath);
      runDockerCompose("down");
    },
  },
  flags.help ? "help" : String(subCommand),
  ...args.map(String),
);

// dsdc list
// dsdc add
// dsdc del/delete
// ===
// dsdc tpl/template list
// dsdc tpl/template add
// dsdc tpl/template del/delete
// dsdc srv/service list
// dsdc srv/service add
// dsdc srv/service del/delete
// ===
// dsdc ports 对外端口注册中心
// dsdc help
