<script setup lang="ts">
import type { File } from '~/types/filesystem';

const filesystemStore = useFilesystemStore();

const props = defineProps<{ settings: File }>();

type settingsType = {
  view: "App" | "Filesystem"
};

const settingsContent = reactive(JSON.parse(props.settings.content) as settingsType);

async function saveSettings() {
  await filesystemStore.updateFileContent(props.settings.path, JSON.stringify(settingsContent, null, 2));
}
</script>

<template>

  <h1>Configurações</h1>

  <select v-model="settingsContent.view" @change="saveSettings" class="form-select">
    <option value="App">App</option>
    <option value="Filesystem">Filesystem</option>
  </select>

</template>