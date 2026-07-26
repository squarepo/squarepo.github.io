<script setup lang="ts">
import { Draggable, Droppable } from '@shopify/draggable';
import type { File, Dir } from '~/types/filesystem';

const props = defineProps<{ dir: Dir }>();
const entryStore = useEntryStore();

async function deleteFile(path: string) {
  const entry = await entryStore.getEntry(path);
  if (confirm(`${entry.type === "file" ? "O arquivo" : "A pasta"} "${entry.name}" será excluíd${entry.type === "file" ? "o" : "a"}`)) {
    await entryStore.deleteFile(path);
    props.dir.children = await entryStore.readDir(props.dir.path);
    if (!(entryStore.currentEntry && await entryStore.exists(entryStore.currentEntry.path))) {
      await entryStore.changeURL("/");
    }
  }
}

async function deleteDir(path: string, recursive: boolean) {
  const entry = await entryStore.getEntry(path);
  if (confirm(`${entry.type === "file" ? "O arquivo" : "A pasta"} "${entry.name}" será excluíd${entry.type === "file" ? "o" : "a"}`)) {
    await entryStore.deleteDir(path, recursive);
    props.dir.children = await entryStore.readDir(props.dir.path);
    if (!(entryStore.currentEntry && await entryStore.exists(entryStore.currentEntry.path))) {
      await entryStore.changeURL("/");
    }
  }
}

async function renameFile(path: string) {
  const entry = await entryStore.getEntry(path);
  if (entry.type !== "file") return;
  const name = prompt(`Renomear arquivo`, entry.name)?.trim();
  if (name === undefined) return;
  const newPath = normalizePath(`/${getParentPath(path)}/${name}`);
  await entryStore.renameFile(path, newPath);
  props.dir.children = await entryStore.readDir(props.dir.path);
  if (path === entryStore.currentEntry?.path) {
    await entryStore.changeURL(newPath);
  }
}

async function renameDir(path: string) {
  const entry = await entryStore.getEntry(path);
  if (entry.type !== "dir") return;
  const name = prompt(`Renomear pasta`, entry.name)?.trim();
  if (name === undefined) return;
  const newPath = normalizePath(`/${getParentPath(path)}/${name}`);
  await entryStore.renameDir(path, newPath);
  props.dir.children = await entryStore.readDir(props.dir.path);
  if (path === entryStore.currentEntry?.path) {
    await entryStore.changeURL(newPath);
  }
}

async function createFile() {
  if (entryStore.currentEntry) {
    const path = entryStore.currentEntry?.type === "file" ? getParentPath(entryStore.currentEntry?.path) : entryStore.currentEntry?.path;
    const name = prompt(`Criar novo arquivo`,  await getName(path, "Arquivo"))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await entryStore.createFile(normalizedPath, "");
    props.dir.children = await entryStore.readDir(props.dir.path);
    await entryStore.changeURL(normalizedPath);
  }
}

async function createDir() {
  if (entryStore.currentEntry) {
    const path = entryStore.currentEntry.type === "file" ? getParentPath(entryStore.currentEntry.path) : entryStore.currentEntry.path;
    const name = prompt(`Criar nova pasta`, await getName(path, "Pasta"))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await entryStore.createDir(normalizedPath);
    props.dir.children = await entryStore.readDir(props.dir.path);
  }
}

async function getName(path: string, baseName: string) {
  let name: string = baseName;
  let num = 0;
  while (await entryStore.exists(normalizePath(`/${path}/${name}`))) {
    name = `${baseName} ${++num}`;
  }
  return name;
}

watch(() => entryStore.root.children, async () => {
  props.dir.children = await entryStore.readDir(props.dir.path);
});

const ul = ref<HTMLUListElement | null>(null);
onMounted(() => {

  const draggable = new Draggable(ul.value!, {
    draggable: 'li',
    distance: 10,
    delay: {
      touch: 300
    },
    mirror: {
      appendTo: document.body,
      constrainDimensions: true,
    }
  });

  draggable.on('drag:start', (e) => {
    if (e.source.classList.contains("parent-dir")) {
      e.cancel();
      return;
    }
    e.source.classList.add('draggable-source');
    e.originalSource.classList.add('draggable-original-source');
  });
  let dragOverEl: HTMLElement | null = null;
  draggable.on("drag:over", (e) => {
    dragOverEl = e.over;
    const isDir = e.over.dataset["type"] === "dir";
    if (isDir && e.over !== e.source) e.over.classList.add("draggable-over");
  });
  draggable.on("drag:out", (e) => {
    e.over.classList.remove("draggable-over");
    dragOverEl = null;
  });
  draggable.on('drag:stop', (e) => {
    e.source.classList.remove('draggable-source');
    e.originalSource.classList.remove('draggable-original-source');
    dragOverEl?.classList.remove("draggable-over");

    const isDir = dragOverEl?.dataset["type"] === "dir";
    if (isDir && dragOverEl !== e.source) {
      const draggedPath = e.source.dataset["path"];
      const droppedPath = dragOverEl?.dataset["path"];
      entryStore.moveEntry(draggedPath!, droppedPath!);
    }
    dragOverEl = null;
  });

});
</script>

<template>
  <div class="d-flex flex-column gap-3">
    <ul ref="ul" v-show="!(props.dir.path === '/' && !props.dir.children.length)" class="list-group w-100">
      <li
        :data-path="getParentPath(dir.path)"
        data-type="dir"
        v-if="entryStore.currentEntry?.path !== '/'"
        class="parent-dir list-group-item p-0 d-flex align-items-center"
      >
        <div class="d-flex align-items-center w-100">
          <i class="bi bi-folder fs-5 ms-2 text-warning"></i>
          <NuxtLink :to="getParentPath(dir.path)" class="w-100 p-2 text-truncate text-body text-decoration-none">..</NuxtLink>
        </div>
      </li>
      <li
        v-for="entry in props.dir.children"
        :key="entry.path"
        :data-path="entry.path"
        :data-type="entry.type"
        class="list-group-item p-0 d-flex align-items-center">
  
        <div class="d-flex w-100 align-items-center text-body">
          <template v-if="entry.type === 'file'">
            <i v-if="entry.name === 'db.json'" class="bi bi-database text-primary fs-5 ms-2"></i>
            <i v-else class="bi text-secondary-emphasis fs-5 ms-2" :class="{ 'bi-file-earmark-text': entry.content, 'bi-file-earmark': !entry.content }"></i>
          </template>
          <i v-else-if="entry.type === 'dir'" class="bi bi-folder fs-5 ms-2 text-warning"></i>
          <NuxtLink :to="entry.path" class="w-100 p-2 text-truncate text-body text-decoration-none">
            {{ entry.name }}
          </NuxtLink>
          <button type="button" class="btn btn-rename border-0 p-0 me-2" @click="entry.type === 'file' ? renameFile(entry.path) : renameDir(entry.path)"><i class="bi bi-pencil"></i></button>
          <button type="button" class="btn btn-delete border-0 p-0 me-2" @click="entry.type === 'file' ? deleteFile(entry.path) : deleteDir(entry.path, true)"><i class="bi bi-trash3"></i></button>
        </div>
  
      </li>
    </ul>
  
    <div class="d-flex gap-3">
      <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createFile()">
        <i class="bi bi-file-earmark-text fs-5"></i>
        <span>Novo arquivo</span>
      </button>
      <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createDir()">
        <i class="bi bi-folder fs-5"></i>
        <span>Nova pasta</span>
      </button>
    </div>
  </div>
</template>

<style>
.btn-delete:hover {
  color: var(--bs-danger);
}
.btn-rename:hover {
  color: var(--bs-secondary);
}

.draggable-original-source {
  display: none !important;
}

.draggable-source {
  z-index: 1500;
  background-color: var(--bs-secondary-bg) !important;
  opacity: .75;
}

.draggable-over {
  background-color: rgba(var(--bs-primary-rgb), 0.25) !important;
}
</style>