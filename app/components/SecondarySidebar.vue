<script setup lang="ts">
import type { Dir, Entry } from '~/types/filesystem';

const props = defineProps<{ entry: Dir }>();

const { $bootstrap } = useNuxtApp();
const entryStore = useEntryStore();
const settingsStore = useSettingsStore();
const route = useRoute();

onMounted(() => {
  const offcanvas = new $bootstrap.Offcanvas(document.getElementById("secondarySidebar")!);
});

</script>

<template>
  <div class="offcanvas offcanvas-end" tabindex="-1" id="secondarySidebar">

    <div class="offcanvas-header">
      <h5 class="offcanvas-title">Painel secundário</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>

    <div class="offcanvas-body">
      <!-- <DirPageProperties :entry="entry"></DirPageProperties> -->
    </div>
    
  </div>
</template>