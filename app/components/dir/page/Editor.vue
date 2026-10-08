<script setup lang="ts">
import type { Entry } from '~/types/filesystem';

const entryStore = useEntryStore();
const props = defineProps<{ entry: Entry }>();

onMounted(() => {
});
</script>

<template>
  <div class="form-control shadow-none border-1" contenteditable>
    <div class="d-flex gap-2" v-for="i in [0, 1, 2]" contenteditable="false">
      <div>[pegar]</div>
      <p class="border w-100" contenteditable>Parágrafo</p>
    </div>
  </div>
</template>