<script setup lang="ts">
import { FILESYSTEM_ENTRIES } from '~/constants/filesystem';
import type { Dir, Repository } from '~/types/filesystem';

const props = defineProps<{ dir: Dir }>();
const entryStore = useEntryStore();

const parentDir = ref<Repository | null>(null);

watch(() => props.dir, async () => {
  if (props.dir.name == FILESYSTEM_ENTRIES.GIT) {
    parentDir.value = await entryStore.getEntry<Repository>(getParentPath(props.dir.path));
  } else {
    parentDir.value = null;
  }
}, { immediate: true });
</script>

<template>

  <DirGit
    v-if="parentDir"
    :repository="parentDir"
  ></DirGit>

</template>