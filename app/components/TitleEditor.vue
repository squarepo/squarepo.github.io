<script setup lang="ts">
import type { File } from '~/domain/filesystem/fs';
import { getParentPath, normalizePath } from '~/domain/filesystem/fs.utils';

const fsStore = useFsStore();

const props = defineProps<{ file: File }>();

async function changeFileName(newName: string) {
  newName = newName.trim();
  const parentPath = getParentPath(props.file.path);
  const newPath = parentPath === "/" ? `/${newName}` : `${parentPath}/${newName}`;
  if (normalizePath(props.file.path) === normalizePath(newPath)) return;
  if (await fsStore.fs.exists(newPath)) return;
  await fsStore.renameFile(props.file.path, newPath);
  await fsStore.changeURL(newPath, 'replace');
}

function revertName(textAreaValue: string) {
  if (textAreaValue !== props.file.name) {
    const textAreaEl = document.getElementById("title-editor") as HTMLTextAreaElement;
    textAreaEl.value = props.file.name;
  }
}
</script>

<template>
  <input
    id="title-editor"
    class="form-control p-3 border-0 shadow-none fs-1 w-100"
    style="box-sizing: border-box;"
    placeholder="Título..."
    :value="file.name"
    @input="changeFileName(($event.target as HTMLTextAreaElement).value)"
    @blur="revertName(($event.target as HTMLTextAreaElement).value)"
  >
</template>