<script setup lang="ts">

import { v4 as uuidv4 } from 'uuid';

const { $bootstrap } = useNuxtApp();
const fsStore = useFsStore();
const route = useRoute();

onMounted(() => {
  const offcanvas = new $bootstrap.Offcanvas(document.getElementById("offcanvas")!);
  watch(
    () => route.fullPath,
    async (fullPath) => {
      offcanvas.hide();
    }
  );
});

async function deleteFile(path: string) {
  await fsStore.removeFile(path);
  if (!(fsStore.currentNode && await fsStore.exists(fsStore.currentNode.path))) {
    await fsStore.changeURL("/");
  }
}

async function createFile(path: string, content: string) {
  await fsStore.writeFile(path, content);
  await fsStore.changeURL(path);
}

</script>

<template>
  <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvas" aria-labelledby="offcanvas">

    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasExampleLabel">Filesystem</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>

    <div class="offcanvas-body">
      <ul class="list-group">
        <li v-if="fsStore.getParentPathFromPath($route.path) === '/'"
          class="list-group-item list-group-item-action p-0 d-flex align-items-center">
          <i class="bi bi-folder2 fs-5 ms-2"></i>
          <NuxtLink to="/" class="w-100 p-2 text-truncate">
            ..
          </NuxtLink>
        </li>
        <li
          v-for="node in fsStore.root.children"
          :key="node.path"
          class="list-group-item list-group-item-action p-0 d-flex align-items-center">
          <i v-if="node.type === 'file'" class="bi bi-file-earmark-text fs-5 ms-2"></i>
          <i v-else-if="node.type === 'dir'" class="bi bi-folder2 fs-5 ms-2"></i>
          <NuxtLink :to="node.path" class="w-100 p-2 text-truncate">
            {{ node.name }}
          </NuxtLink>
          <button type="button" class="btn btn-outline-danger p-1 m-2" @click="deleteFile(node.path)"><i class="bi bi-trash3"></i></button>
        </li>
      </ul>
    </div>
    
    <div class="p-3 d-flex gap-3">
      <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createFile(`/${uuidv4()}.txt`, '')">
        <i class="bi bi-file-earmark-text fs-5"></i>
        <span>Novo arquivo</span>
      </button>
      <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="fsStore.mkdir(`/${uuidv4()}`)">
        <i class="bi bi-folder2 fs-5"></i>
        <span>Nova pasta</span>
      </button>
    </div>
    
  </div>
</template>