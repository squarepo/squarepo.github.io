<script setup lang="ts">
import type { Settings } from '~/domain/entry/settings';

const props = defineProps<{ settings: Settings }>();
</script>

<template>
  <div class="container d-flex flex-column gap-5 my-5">
    <h1>Configurações</h1>
  
    <div class="row align-items-center">
      <div class="col">
        Sistema de arquivos
      </div>
      <div class="col">
        <select class="form-select">
          <option value="appFs">App filesystem</option>
          <option value="fs">Filesystem</option>
        </select>
      </div>
    </div>
  </div>
</template>