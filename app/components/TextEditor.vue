<script setup lang="ts">
import type { File } from '~/types/fs';

const fsStore = useFsStore();
const textareaEl = ref<HTMLTextAreaElement | null>(null);

async function updateFileContent(newContent: string) {
  if (textareaEl.value) updateTextareaHeight(textareaEl.value);
  if (fsStore.currentEntry) {
    await fsStore.updateFileContent(fsStore.currentEntry.path, newContent);
  }
}

function updateTextareaHeight(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

onMounted(() => {
  if (textareaEl.value) {
    updateTextareaHeight(textareaEl.value);
    window.addEventListener("resize", () => updateTextareaHeight(textareaEl.value!));
  }
});
</script>

<template>
  <div class="d-flex flex-grow-1">
    <textarea
      ref="textareaEl"
      class="form-control p-3 pb-5 rounded-0 border-0 shadow-none overflow-hidden w-100"
      style="resize: none; box-sizing: border-box; overflow-anchor: none;"
      placeholder="Texto..."
      :value="(fsStore.currentEntry as File)?.content"
      @input="updateFileContent(($event.target as HTMLTextAreaElement).value)"
    ></textarea>
  </div>
</template>