<script setup lang="ts">

// const { $bootstrap } = useNuxtApp();
const fsStore = useFsStore();

onMounted(() => {
  // const offcanvas = new $bootstrap.Offcanvas(document.getElementById("offcanvas")!);
});
</script>

<template>
  <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvas" aria-labelledby="offcanvas">

    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasExampleLabel">Offcanvas</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>

    <div class="offcanvas-body">
      <div>
        <ul>
          <li v-for="node in fsStore.root.children"><a :href="node.path">{{ node.name }}</a></li>
        </ul>
      </div>
      <div>
        <button type="button" class="btn btn-primary" @click="fsStore.writeFile(`/arquivo_${fsStore.root.children.length}.txt`, `Texto do arquivo ${fsStore.root.children.length}.`)">Novo arquivo</button>
      </div>
    </div>

  </div>
</template>