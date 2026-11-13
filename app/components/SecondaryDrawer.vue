<script setup lang="ts">
import type { Dir, Entry } from '~/types/filesystem';

const props = defineProps<{ entry: Dir }>();

const { $bootstrap } = useNuxtApp();
const entryStore = useEntryStore();
const settingsStore = useSettingsStore();
const route = useRoute();

onMounted(() => {
  const drawer = new $bootstrap.Drawer(document.getElementById("secondarySidebar")!);
});

</script>

<template>
  <div class="drawer drawer-end" tabindex="-1" id="secondarySidebar">

    <div class="drawer-header">
      <h5 class="drawer-title">Painel secundário</h5>
      <button type="button" class="btn-close" data-bs-dismiss="drawer"></button>
    </div>

    <div class="drawer-body">
      <!-- <DirPageProperties :entry="entry"></DirPageProperties> -->
    </div>
    
  </div>
</template>