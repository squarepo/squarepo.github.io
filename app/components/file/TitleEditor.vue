<script setup lang="ts">
  import type { Entry } from '~/types/filesystem';
  const entryStore = useEntryStore();

  const props = defineProps<{ entry: Entry }>();

  async function changeName(newName: string) {
    newName = newName.trim();
    await entryStore.rename(props.entry.path, newName);

    const parentPath = getParentPath(props.entry.path);
    const newPath = parentPath == "/" ? `/${newName}` : `${parentPath}/${newName}`;
    await entryStore.changeURL(newPath, 'replace');
  }
  
  function revertName(textAreaValue: string) {
    if (props.entry && textAreaValue !== props.entry.name) {
      const textAreaEl = document.getElementById("title-editor") as HTMLTextAreaElement;
      textAreaEl.value = props.entry.name;
    }
  }
</script>

<template>
  <input
    id="title-editor"
    class="form-control p-3 border-0 shadow-none fs-1 w-100"
    style="box-sizing: border-box;"
    placeholder="Título..."
    :value="entry?.name"
    @input="changeName(($event.target as HTMLTextAreaElement).value)"
    @blur="revertName(($event.target as HTMLTextAreaElement).value)"
  >
</template>