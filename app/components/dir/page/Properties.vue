<script setup lang="ts">
  import { FILESYSTEM_ENTRIES } from '~/constants/filesystem';
  import type { Dir } from '~/types/filesystem';
  import type { Property, TextProperty } from '~/types/properties';
  const entryStore = useEntryStore();

  const props = defineProps<{ entry: Dir }>();

  const properties = ref<Property[]>([]);

  async function addPropertie() {
    // 1 - Verificar se existe o arquivo properties.json
    // 2 - Verificar se o arquivo está vazio
    // 3 - Adicionar a propriedade
    if (!props.entry.propertiesFile) {
      await entryStore.createFile(`${props.entry.path}/${FILESYSTEM_ENTRIES.PROPERTIES}`, "[]");
    }
    properties.value?.push({ name: "Nome", type: "text", value: "" } as TextProperty);
    await updatePropertiesFile();
  }

  async function deletePropertie(index: number) {
    properties.value.splice(index, 1);
  }

  async function updatePropertiesFile() {
    const content = JSON.stringify(properties.value, null, 2);
    await entryStore.updateFileContent(props.entry.propertiesFile?.path!, content);
  }

  onMounted(() => {
    watch(props.entry, (entry) => {
      let content: Property[] = [];
      if (entry.propertiesFile?.content) content = JSON.parse(entry.propertiesFile.content ?? "[]");
      properties.value = content;
    }, { immediate: true });
    watch(properties, async (p) => await updatePropertiesFile(), { deep: true });
  });
</script>

<template>
  <div class="p-3 d-flex flex-column gap-2 align-items-start">
    <div class="input-group" v-for="(p, i) in properties">
      <span class="input-group-text"><i class="bi bi-justify-left"></i></span>
      <input type="text" class="form-control bg-body-tertiary" v-model="p.name">
      <input type="text" class="form-control" v-model="p.value">
      <button @click="deletePropertie(i)" class="btn btn-outline-secondary" type="button"><i class="bi bi-trash3"></i></button>
    </div>

    <button type="button" class="btn btn-sm d-flex align-items-center justify-content-center gap-2" @click="addPropertie()">
      <i class="bi bi-plus fs-5"></i>
      <span>Adicionar propriedade</span>
    </button>
  </div>
</template>