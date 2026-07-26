<script setup lang="ts">
import type { Dir } from '~/types/filesystem';

const props = defineProps<{ entry: Dir }>();

const entryStore = useEntryStore();

watch(props.entry, async () => {
  props.entry.children = await entryStore.readDir(props.entry.path);
  props.entry.children = props.entry.children.filter(e => ['dir', 'page', 'database'].includes(e.type));
}, { immediate: true });
</script>

<template>

  <FileTitleEditor :entry="entry"></FileTitleEditor>

  <DirDatabaseBar :entry="entry"></DirDatabaseBar>

  <div class="border p-3 d-flex gap-3 overflow-auto">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Nome</th>
          <th scope="col">Caminho</th>
          <th scope="col">Tipo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in entry.children">
          <td><NuxtLink :to="e.path">{{ e.name }}</NuxtLink></td>
          <td>{{ e.path }}</td>
          <td>{{ e.type }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>