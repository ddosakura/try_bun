# try_bun

> ddosakura/hakke:1.3.0-standard 测试，以新增的 bun 运行时为主

- [bun](https://bun.sh/docs)
  - [x] https://bun.sh/docs/install/cache
  - [x] https://bun.sh/docs/install/workspaces
  - [x] https://bun.sh/docs/bundler/macros
  - [x] https://bun.sh/docs/cli/test
  - [x] https://bun.sh/docs/test/dom

- deno&jupyter
  - [x] simple script
  - [x] https://deno.com/blog/v1.37#jupyter-notebook-integration
  - [x] https://code.visualstudio.com/docs/datascience/jupyter-notebooks

```bash
# deno jupyter --unstable
deno jupyter --unstable --install
# [InstallKernelSpec] Installed kernelspec deno in /home/vscode/.local/share/jupyter/kernels/deno

pip install notebook
jupyter notebook
```

- windmill
  - [x] wmill CLI
  - [x] workspaces

```bash
deno install --unstable -A https://deno.land/x/wmill/main.ts
echo "export PATH=\"/home/vscode/.deno/bin:\$PATH\"" >> "/home/vscode/.bashrc"
echo "source <(wmill completions bash)" >> "/home/vscode/.bashrc"
echo "export PATH=\"/home/vscode/.deno/bin:\$PATH\"" >> "/home/vscode/.zshrc"
echo "source <(wmill completions zsh)" >> "/home/vscode/.zshrc"
```
