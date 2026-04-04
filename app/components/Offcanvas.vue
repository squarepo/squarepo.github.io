<script setup lang="ts">

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
      <h5 class="offcanvas-title" id="offcanvasExampleLabel">Offcanvas</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>

    <div class="offcanvas-body">
      <ul class="list-group">
        <li
          v-for="node in fsStore.root.children"
          :key="node.path"
          class="list-group-item list-group-item-action p-0 d-flex">
          <NuxtLink :to="node.path" class="w-100 p-2 text-truncate">{{ node.name }}</NuxtLink>
          <button type="button" class="btn btn-outline-danger p-1 m-2" @click="deleteFile(node.path)"><i class="bi bi-trash3"></i></button>
        </li>
      </ul>
    </div>
    
    <div class="p-3">
      <button type="button" class="btn btn-primary w-100" @click="createFile(`/arquivo_${fsStore.root.children.length}.txt`, `Texto do arquivo ${fsStore.root.children.length}.`)">Novo arquivo</button>
    </div>
    
  </div>
</template>