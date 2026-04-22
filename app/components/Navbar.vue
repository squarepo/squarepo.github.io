<script setup lang="ts">
import type { File, Dir } from '~/domain/filesystem/fs';
import { normalizePath } from '~/domain/filesystem/fs.utils';

const fsStore = useFsStore();
const route = useRoute();
const pathEntries = ref<(File | Dir)[]>([]);

const view = defineModel<"fs" | "appFs">('view');

watch(
  () => route.fullPath,
  async (fullPath) => {
    pathEntries.value = await fsStore.getPathEntries(normalizePath(decodeURIComponent(route.path)));
  },
  { immediate: true }
);

function toggleView() {
  if (view.value === "fs") {
    view.value = "appFs";
  } else if (view.value === "appFs") {
    view.value = "fs";
  }
}
</script>

<template>
  <nav class="navbar p-0 bg-body-tertiary">
    <div class="w-100 h-100 d-flex align-items-center">
      <button type="button" class="btn btn-outline-secondary fs-2 p-1 m-2" data-bs-toggle="offcanvas" data-bs-target="#offcanvas">
        <i class="bi bi-list"></i>
      </button>
      <div class="w-100 h-100 px-2 overflow-auto d-flex align-items-center">
        <ol
          v-if="pathEntries.length > 1"
          class="breadcrumb m-0 d-flex flex-nowrap text-nowrap"
        >
          <li
            v-for="(entry, i) in pathEntries"
            :key="`navbar-${entry.path}`"
            class="breadcrumb-item flex-shrink-0"
            :class="{ active: pathEntries.length === i + 1 }"
          >
            <NuxtLink v-if="(i + 1) < pathEntries.length" class="text-decoration-none" :to="entry.path">{{ entry.name }}</NuxtLink>
            <div v-else class="d-inline">{{ entry.name }}</div>
          </li>
          <div class="ps-2"></div>
        </ol>
      </div>
      <button type="button" class="btn fs-2 p-1 m-2" @click="toggleView()">
        <i class="bi" :class="{ 'bi-eye': view === 'fs', 'bi-eye-fill': view === 'appFs' }"></i>
      </button>
    </div>
  </nav>
</template>

<style>
.breadcrumb-item:nth-child(2)::before {
  content: none;
}
</style>