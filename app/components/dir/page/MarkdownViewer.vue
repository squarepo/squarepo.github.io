<script setup lang="ts">
import type { File } from '~/types/filesystem';
import { marked } from 'marked';

const entryStore = useEntryStore();
const props = defineProps<{ file: File }>();

const markdownHtml = ref(marked.parse(props.file.content));

onMounted(() => {
});
</script>

<template>
  <div class="d-flex flex-grow-1">
    <div
      v-html="markdownHtml"
      class="p-3 w-100"
    ></div>
  </div>
</template>