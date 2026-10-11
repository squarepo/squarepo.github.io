<script setup lang="ts">
import type { Entry } from '~/types/filesystem';
import type { Settings } from '~/types/settings';

const props = defineProps<{
  view: Settings["view"];
  entry: Entry
}>();
const entryStore = useEntryStore();
const settingsStore = useSettingsStore();
</script>

<template>
  <template v-if="view === 'App'">
    <i v-if="entry.type === 'settings'" class="bi bi-gear text-secondary-emphasis fs-5 ms-2"></i>
    <i v-else-if="entry.type === 'properties'" class="bi bi-puzzle text-secondary-emphasis fs-5 ms-2"></i>
    <i v-else-if="entry.type === 'repository'" class="bi bi-archive text-primary fs-5 ms-2"></i>
    <i v-else-if="entry.type === 'page'" class="bi text-secondary-emphasis fs-5 ms-2" :class="{ 'bi-file-earmark-text': entry.mainEntry.content, 'bi-file-earmark': !entry.mainEntry.content }"></i>
    <i v-else-if="entry.type === 'database'" class="bi bi-database text-danger fs-5 ms-2"></i>
    <i v-else-if="entry.type === 'dir'" class="bi fs-5 ms-2 text-warning" :class="{ 'bi-folder2-open': entryStore.expandedDirs.has(entry.path), 'bi-folder': !entryStore.expandedDirs.has(entry.path) }"></i>
  </template>
  <template v-else-if="view === 'Filesystem'">
    <i v-if="['file', 'settings', 'properties'].includes(entry.type)" class="bi text-secondary-emphasis fs-5 ms-2" :class="{ 'bi-file-earmark-text': entry.content, 'bi-file-earmark': !entry.content }"></i>
    <i v-else-if="['dir', 'page', 'database', 'repository'].includes(entry.type)" class="bi fs-5 ms-2 text-warning" :class="{ 'bi-folder2-open': entryStore.expandedDirs.has(entry.path), 'bi-folder': !entryStore.expandedDirs.has(entry.path) }"></i>
  </template>
</template>