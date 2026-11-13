<script setup lang="ts">
import type { File, Dir } from '~/types/filesystem';

const entryStore = useEntryStore();
const route = useRoute();
const pathEntries = ref<(File | Dir)[]>([]);

function toggleRaw() {
  entryStore.raw = !entryStore.raw;
}

watch(
  () => route.fullPath,
  async (fullPath) => {
    pathEntries.value = await entryStore.getPathEntries(normalizePath(decodeURIComponent(route.path)));
  },
  { immediate: true }
);
</script>

<template>
  <nav class="navbar p-0 bg-1">
    <div class="w-100 h-100 d-flex align-items-center">
      <button type="button" class="btn-text btn-icon fs-xl m-2" data-bs-toggle="drawer" data-bs-target="#primaryDrawer">
        <i class="bi bi-list"></i>
      </button>
      <div class="w-100 h-100 px-2 overflow-auto justify-content-between d-flex align-items-center">
        <ol
          v-if="pathEntries.length > 1"
          class="breadcrumb m-0 d-flex flex-nowrap text-nowrap"
        >
          <template
            v-for="(entry, i) in pathEntries"
            :key="`navbar-${entry.path}`"
          >
            <li
              class="breadcrumb-item flex-shrink-0"
              :class="{ 'me-3': i == 0 }"
            >
              <NuxtLink v-if="(i + 1) < pathEntries.length" class="text-decoration-none" :to="entry.path">{{ entry.name }}</NuxtLink>
              <div v-else class="d-inline">{{ entry.name }}</div>
            </li>
            <li
              v-if="i > 0 && i < (pathEntries.length - 1)"
              class="breadcrumb-divider mx-3"
            >/</li>
          </template>
          <div class="ps-2"></div>
        </ol>
      </div>
      <button
        class="btn-text btn-icon fs-xl m-2"
        @click="toggleRaw"
      >
        <i class="bi" :class="{ 'bi-book': !entryStore.raw, 'bi-pencil': entryStore.raw }"></i>
      </button>
    </div>
  </nav>
</template>

<style>
.breadcrumb-item:nth-child(2)::before {
  content: none;
}
</style>