<script setup lang="ts">
import type { File, Dir } from '~/types/fs';

const fsStore = useFsStore();
const route = useRoute();
const pathEntries = ref<(File | Dir)[]>([]);
watch(
  () => route.fullPath,
  async (fullPath) => {
    pathEntries.value = await fsStore.getPathEntries(fsStore.normalizePath(decodeURIComponent(route.path)));
  },
  { immediate: true }
);
</script>

<template>
  <nav class="navbar bg-body-tertiary">
    <div class="px-3 w-100 d-flex align-items-center gap-3">
      <button type="button" class="btn btn-outline-secondary fs-2 p-1" data-bs-toggle="offcanvas" data-bs-target="#offcanvas">
        <i class="bi bi-list"></i>
      </button>
      <ol
        v-if="pathEntries.length > 1"
        class="breadcrumb m-0 d-flex flex-nowrap text-truncate w-100 overflow-auto"
      >
        <li
          v-for="(entry, i) in pathEntries"
          :key="`navbar-${entry.path}`"
          class="breadcrumb-item flex-shrink-0"
          :class="{ active: pathEntries.length === i + 1 }"
        >
          <NuxtLink v-if="(i + 1) < pathEntries.length" class="text-decoration-none" :to="entry.path">{{ entry.name }}</NuxtLink>
          <div v-else>{{ entry.name }}</div>
        </li>
      </ol>
    </div>
  </nav>
</template>

<style>
.breadcrumb-item:nth-child(2)::before {
  content: none;
}
</style>