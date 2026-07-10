<script setup lang="ts">
import type { File } from '~/types/filesystem';

const filesystemStore = useFilesystemStore();
const settingsStore = useSettingsStore();

const props = defineProps<{ settings: File }>();

type settingsType = {
  view: "App" | "Filesystem"
};

const settingsContent = reactive(JSON.parse(props.settings.content) as settingsType);

async function saveSettings() {
  await filesystemStore.updateFileContent(props.settings.path, JSON.stringify(settingsContent, null, 2));
  await settingsStore.refresh();
}
</script>

<template>
  <div class="container my-5">

    <h1 class="mb-5">Configurações</h1>

    <div class="d-flex align-items-center">
      <label class="text-end me-3" for="settingsView">View</label>
      <select v-model="settingsContent.view" @change="saveSettings" class="form-select" style="width: fit-content;" id="settingsView">
        <option value="App">App</option>
        <option value="Filesystem">Filesystem</option>
      </select>
    </div>

  </div>
</template>