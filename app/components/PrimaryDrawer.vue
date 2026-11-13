<script setup lang="ts">
import type { ContextMenuItem } from '~/types/contextMenu';
import type { Dir } from '~/types/filesystem';

const { $bootstrap } = useNuxtApp();
const entryStore = useEntryStore();

const props = defineProps<{
  root: Dir
}>();

const emit = defineEmits<{
  changeRoot: [rootPath: string]
}>();

const repositories = computed(() => {
  let groupsAndRepos = entryStore.root.children.filter(e => {
    return e.type == "repository"
      || (e.type == "dir" && e.children.find(e => e.type == "repository"));
  });
  groupsAndRepos = groupsAndRepos.map(e => {
    if (e.type == "dir") {
      const filteredChildren = e.children.filter(e => e.type == "repository");
      return { ...e, children: filteredChildren };
    } else {
      return e;
    }
  });
  return groupsAndRepos;
});

const contextMenu = ref<{
  x: number,
  y: number,
  items: ContextMenuItem[]
} | null>(null);

function openContextMenu(event: MouseEvent) {
  contextMenu.value = {
    x: event.clientX,
    y: event.clientY,
    items: [
      {
        type: 'item',
        label: "Criar página",
        value: "create-page"
      },
      {
        type: 'item',
        label: "Criar pasta",
        value: "create-folder"
      },
      {
        type: 'divider'
      },
      {
        type: 'item',
        label: "Criar repositório",
        value: "create-repository"
      },
      {
        type: 'item',
        label: "Clonar repositório",
        value: "clone-repository"
      },
      {
        type: 'divider'
      },
      {
        type: 'item',
        label: "Criar configurações",
        value: "create-settings"
      }
    ]
  }
}

async function handleContextMenuSelect(item: Extract<ContextMenuItem, { type: "item" }>) {
  const rootPath = props.root.path;
  switch (item.value) {
    case "create-page": await entryStore.createPage(rootPath); break;
    case "create-folder": await entryStore.createFolder(rootPath); break;
    case "create-repository": await entryStore.createRepository(rootPath); break;
    case "clone-repository": await entryStore.cloneRepository(rootPath); break;
    case "create-settings": await entryStore.createSettings(rootPath); break;
  }
}

onMounted(() => {
  const drawer = new $bootstrap.Drawer(document.getElementById("primaryDrawer")!);
});

</script>

<template>
  <dialog class="drawer drawer-start" tabindex="-1" id="primaryDrawer">

    <div class="drawer-header">
      <select
        class="form-control me-4"
        @change="emit('changeRoot', ($event.target as HTMLSelectElement).value)"
      >
        <option value="/">Raiz</option>
        <option
          v-for="repo in repositories.filter(e => e.type == 'repository')"
          :value="repo.path"
          :key="repo.path"
        >
          {{ repo.name }}
        </option>
        <optgroup
          v-for="group in repositories.filter(e => e.type == 'dir')"
          :label="group.name"
          :key="group.path"
        >
          <option
            v-for="repo in group.children"
            :value="repo.path"
            :key="repo.path"
          >
            {{ repo.name }}
          </option>
        </optgroup>
      </select>
      <button type="button" class="btn-close m-0" data-bs-dismiss="drawer"></button>
    </div>

    <div
      class="drawer-body pt-0"
      @contextmenu.prevent.stop="openContextMenu"
    >
      <ItemTree v-if="root.children.length" :entries="root.children"></ItemTree>
      <div v-else class="fg-4 w-100 h-100 d-flex justify-content-center align-items-center user-select-none">
        <span>Nenhum arquivo ou pasta</span>
      </div>

      <ContextMenu
        v-if="contextMenu"
        :x="contextMenu.x"
        :y="contextMenu.y"
        :items="contextMenu.items"
        @select="handleContextMenuSelect"
        @close="contextMenu = null"
      />
    </div>
    
  </dialog>
</template>