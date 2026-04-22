<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>();

useHead({
  title: "Erro"
});
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column">
    
    <Offcanvas></Offcanvas>

    <Navbar></Navbar>

    <div class="container my-3 w-100 h-100 d-flex flex-column">
      <h1>Erro</h1>
      <pre>{{ props.error }}</pre>
    </div>
    
  </div>
</template>

<style>
html, body, #__nuxt {
  width: 100dvw;
  height: 100dvh;
}
#__nuxt {
  overflow: hidden;
}
.bi, .bi::before {
  display: block;
}
</style>