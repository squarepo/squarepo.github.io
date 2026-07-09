<script setup lang="ts">
  import type { File } from '~/types/filesystem';
  const filesystemStore = useFilesystemStore();

  const props = defineProps<{ file: File }>();

  async function changeFileName(newName: string) {
    newName = newName.trim();
    await filesystemStore.renameFile(props.file.path, newName);

    const parentPath = getParentPath(props.file.path);
    const newPath = parentPath == "/" ? `/${newName}` : `${parentPath}/${newName}`;
    await filesystemStore.changeURL(newPath, 'replace');
  }
  
  function revertName(textAreaValue: string) {
    if (props.file && textAreaValue !== props.file.name) {
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
    :value="file?.name"
    @input="changeFileName(($event.target as HTMLTextAreaElement).value)"
    @blur="revertName(($event.target as HTMLTextAreaElement).value)"
  >
</template>