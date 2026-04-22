<script setup lang="ts">
import type { File } from '~/domain/filesystem/fs';

const props = defineProps<{ file: File }>();
</script>

<template>
  <div class="w-100 h-100 overflow-auto d-flex flex-column">
    <div class="container p-0 my-3 w-100 h-100 d-flex flex-column">
      <TitleEditor :file="file"></TitleEditor>
      <TextEditor :file="file"></TextEditor>
    </div>
  </div>
</template>