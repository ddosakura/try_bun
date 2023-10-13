export * as toml from "https://deno.land/std@0.203.0/toml/mod.ts";
export * as yaml from "https://deno.land/std@0.203.0/yaml/mod.ts";
export { basename, join } from "https://deno.land/std@0.203.0/path/mod.ts";
export { deepMerge } from "https://deno.land/std@0.203.0/collections/deep_merge.ts";

export { $ } from "https://deno.land/x/dax@0.35.0/mod.ts";

export { diff, DiffTerm } from "https://deno.land/x/diff_kit@v2.0.4/mod.ts";

export { createSingletonPromise } from "https://esm.sh/@antfu/utils@0.7.6";

// https://github.com/futpib/compose-spec-schema
// https://github.com/compose-spec/compose-spec/blob/master/schema/compose-spec.json
export type { Compose as DockerComposeSchema } from "https://esm.sh/compose-spec-schema@1.0.0";

export {
  Confirm,
  Input,
  Number,
  Secret,
  Select,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";
