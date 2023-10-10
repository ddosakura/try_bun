<script setup lang="ts">
// import type { TextDocument } from "vscode-languageserver-textdocument";
const foo = "foo";
if (Math.random() < 0.5) {
  console.log(0);
}
</script>

<template>
  <div :value="{
    foo
  }"></div>
  <div :value="{
    foo
  }"></div>
</template>
