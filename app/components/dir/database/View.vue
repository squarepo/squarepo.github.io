<script setup lang="ts">
import type { File } from '~/types/filesystem';
const filesystemStore = useFilesystemStore();
const parentDir = getParentPath(filesystemStore.currentEntry?.path ?? "/");
const columns = (await filesystemStore.readDir(parentDir)).filter(entry => entry.type === "dir");
for (const col of columns) {
  col.children = (await filesystemStore.readDir(col.path)).filter(entry => entry.type === "file");
}

onMounted(() => {
  const containerEl = document.querySelector(".kanban-container") as HTMLDivElement;
  const columnEls = document.querySelectorAll(".kanban-column") as NodeListOf<HTMLDivElement>;
  for (const columnEl of columnEls) {
  }
});

async function createFile(path: string) {
  if (filesystemStore.currentEntry) {
    const name = prompt(`Criar novo cartão`,  await getName(path, "Cartão"))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await filesystemStore.createFile(normalizedPath, "");
  }
}

async function getName(path: string, baseName: string) {
  let name: string = baseName;
  let num = 0;
  while (await filesystemStore.exists(normalizePath(`/${path}/${name}`))) {
    name = `${baseName} ${++num}`;
  }
  return name;
}
</script>

<template>
  <div class="border p-3 d-flex gap-3 overflow-auto kanban-container">

    <div v-for="column in columns" class="card" style="min-width: 50%; height: fit-content;">
      <div class="card-header">
        {{ column.name }}
      </div>
      <div class="card-body kanban-column d-flex flex-column gap-3">
        
        <div v-for="card in column.children" class="card">
          <div class="card-body">
            <NuxtLink :to="card.path">{{ card.name }}</NuxtLink>
            <div>{{ (card as File).content }}</div>
          </div>
        </div>
        
      </div>
      <div class="card-footer d-flex flex-column gap-3">
        
        <button type="button" class="btn btn-outline-secondary" @click="createFile(column.path)">Novo cartão</button>
        
      </div>
    </div>

  </div>
</template>