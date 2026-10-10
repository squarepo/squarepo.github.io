<script setup lang="ts">
import type { Page } from '~/types/filesystem';
const props = defineProps<{ entry: Page }>();
const entryStore = useEntryStore();
</script>

<template>
  <FileTitleEditor :entry="entry"></FileTitleEditor>
  <DirPageMarkdownViewer
    v-if="entryStore.raw"
    :file="entry.mainEntry"
  ></DirPageMarkdownViewer>
  <FileTextEditor
    v-else
    :file="entry.mainEntry"
  ></FileTextEditor>
</template>