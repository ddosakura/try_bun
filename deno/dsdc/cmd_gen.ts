import {
  $,
  Confirm,
  type DockerComposeSchema,
  Input,
  Number,
  Select,
} from "./deps.ts";
import { loadDockerCompose, merge } from "./utils.ts";

export async function gen(
  base: DockerComposeSchema,
  override: DockerComposeSchema,
) {
  const config: DockerComposeSchema = structuredClone(base);
  const services = config.services ?? {};
  if (!config.services) {
    config.services = services;
  }
  for await (const [name, cfg] of Object.entries(override.services ?? {})) {
    if (
      !await Confirm.prompt({
        message: `override service "${name}"`,
        default: false,
      })
    ) continue;
    const newName = await Input.prompt({
      message: "name",
      default: name,
    });
    if (newName !== name) {
      services[newName] = services[name];
      delete services[name];
    }
    const srv = services[newName] ?? {};
    if (!services[newName]) {
      services[newName] = srv;
    }

    if (cfg.command) {
      srv.command = await Input.prompt({
        message: "command",
        default: Array.isArray(cfg.command)
          // TODO: 优化
          ? cfg.command.join(" ")
          : cfg.command,
      });
    }
    if (cfg.deploy?.replicas) {
      if (!srv.deploy) srv.deploy = {};
      srv.deploy.replicas = await Number.prompt({
        message: "replicas",
        default: cfg.deploy.replicas,
      });
    }
    // TODO: deploy resources limits cpu/mem/gpu
    if (cfg.image) {
      srv.image = await Input.prompt({
        message: "image",
        default: cfg.image,
      });
    }
    if (cfg.restart) {
      srv.restart = await Select.prompt({
        message: "restart",
        options: [
          "unless-stopped",
          "always",
        ],
        default: cfg.restart,
      });
    }

    if (cfg.environment) {
    }
    if (cfg.ports) {
    }
    if (cfg.volumes) {
    }

    // depends_on
  }
  return merge(config);
}

if (import.meta.main) {
  const dir = ".cache/templates/example2";
  const base = await loadDockerCompose(`${dir}/docker-compose.yml`);
  const override = await loadDockerCompose(
    `${dir}/docker-compose.override.yml`,
  );
  console.log(await gen(base, override));
}
