<script setup lang="ts">
import type { File } from '~/types/fs';

const fsStore = useFsStore();
const props = defineProps<{ file: File }>();
const textareaEl = ref<HTMLTextAreaElement | null>(null);

async function updateFileContent(newContent: string) {
  if (textareaEl.value) updateTextareaHeight(textareaEl.value);
  await fsStore.updateFileContent(props.file.path, newContent);
}

function updateTextareaHeight(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight - 10 + "px";
}

onMounted(() => {
  if (textareaEl.value) {
    window.addEventListener("resize", () => updateTextareaHeight(textareaEl.value!));
    watch(() => props.file, async () => {
      await nextTick();
      updateTextareaHeight(textareaEl.value!);
    }, { immediate: true });
  }
});
</script>

<template>
  <div class="d-flex flex-grow-1">
    <textarea
      ref="textareaEl"
      class="form-control p-3 border-0 shadow-none overflow-hidden w-100"
      style="resize: none; box-sizing: border-box; padding-bottom: 200px !important;"
      placeholder="Texto..."
      :value="props.file.content"
      @input="updateFileContent(($event.target as HTMLTextAreaElement).value)"
    ></textarea>
  </div>
</template>