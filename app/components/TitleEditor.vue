<script setup lang="ts">
  const fsStore = useFsStore();
</script>

<template>
  <textarea class="form-control w-100" placeholder="Editor de título..." :value="fsStore.currentNode?.name"></textarea>
</template>