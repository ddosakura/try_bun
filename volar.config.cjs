// const { spawn } = require('node:child_process');
// const ls = spawn('ls', ['-lh', '/usr']);

const { promisify } = require("node:util");
const exec = promisify(require("node:child_process").exec);
const fs = require("node:fs");
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);
const os = require("node:os");
const path = require("node:path");

const tempDir = os.tmpdir();
async function format(src, lang, {
  tabSize = 2,
  insertSpaces = true,
}) {
  const tempFile = path.join(
    tempDir,
    `volar-deno-fmt-${+new Date()}-${Math.random()}.${lang}`,
  );
  try {
    console.log(">", tempFile);
    await writeFileAsync(tempFile, src);

    const args = insertSpaces
      // invalid value '0' for '--indent-width <indent-width>': number would be zero for non-zero type
      ? `--indent-width=${tabSize || 2}`
      : `--use-tabs=true`;
    const cmd = `deno fmt ${args} ${tempFile}`;
    console.log("$", cmd);
    // const { stdout, stderr } = await exec(cmd);
    // console.log("format/stdout:", stdout);
    // console.error("format/stderr:", stderr);
    await exec(cmd);

    const code = await readFileAsync(tempFile, "utf8");
    await unlinkAsync(tempFile);
    return code;
  } catch (err) {
    console.error("format/error:", err);
  }
  return src;
}

// https://github.com/volarjs/services
// [Plugin API v1](https://github.com/volarjs/volar.js/issues/14)
module.exports = {
  services: [
    // require("volar-service-typescript").create(),
    // https://github.com/vuejs/language-tools/issues/3584
    function () {
      return {
        async provideDocumentFormattingEdits(
          document,
          _range,
          options,
          _token,
        ) {
          if (!["typescript", "javascript"].includes(document.languageId)) {
            return;
          }
          const lang = {
            typescript: "ts",
            javascript: "js",
          }[document.languageId];

          // 解决 template 中 js 代码换行导致的格式化问题
          if (document.uri.endsWith(`.vue.template_format.${lang}`)) {
            return;
          }

          const src = document.getText();
          const formattedText = await format(src, lang, options);

          if (formattedText === src) return [];

          // console.log("===src===");
          // console.log(src);
          // console.log("===formattedText===");
          // console.log(formattedText);
          // console.log("===end===");

          return [
            {
              range: {
                start: document.positionAt(0),
                end: document.positionAt(src.length),
              },
              newText: formattedText,
            },
          ];
        },
      };
    },
  ],
};
