<script setup lang="ts">
  const fsStore = useFsStore();
</script>

<template>
  <nav class="navbar bg-body-tertiary">
    <div class="px-3 w-100 d-flex align-items-center gap-3">
      <button type="button" class="btn btn-outline-secondary fs-2 p-1" data-bs-toggle="offcanvas" data-bs-target="#offcanvas">
        <i class="bi bi-list"></i>
      </button>
      <ol class="breadcrumb m-0 d-flex flex-nowrap text-truncate">
        <li class="breadcrumb-item"><NuxtLink to="/">root</NuxtLink></li>
        <li class="breadcrumb-item text-truncate active">{{ fsStore.currentEntry?.name }}</li>
      </ol>
    </div>
  </nav>
</template>