<script setup lang="ts">
import { FILESYSTEM_ENTRIES } from '~/constants/filesystem';
import type { Repository } from '~/types/filesystem';

const props = defineProps<{ repository: Repository }>();
const entryStore = useEntryStore();

const branches = ref(await entryStore.listBranches(props.repository.path));
const gitLog = ref(await entryStore.getGitLog(props.repository.path));

watch(
  () => props.repository,
  async (repo) => {
    const [newBranches, newGitLog] = await Promise.all([
      entryStore.listBranches(repo.path),
      entryStore.getGitLog(repo.path)
    ]);

    branches.value = newBranches;
    gitLog.value = newGitLog;
  },
  { immediate: true }
);

</script>

<template>
  <div>

    <h1>Git</h1>
  
    <div>Branch</div>
  
    <select class="form-select">
      <option
        v-for="branch in branches"
        :key="branch"
        :value="branch"
      >
        {{ branch }}
      </option>
    </select>

    <div>log</div>

    <pre>{{ gitLog }}</pre>

  </div>
</template>