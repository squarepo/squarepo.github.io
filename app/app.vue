<template>
  <div class="w-100 h-100 d-flex flex-column">
    
    <Offcanvas></Offcanvas>

    <Navbar></Navbar>

    <!-- Editor -->
    <div class="p-3 w-100 h-100 d-flex flex-column gap-3">
      <TitleEditor></TitleEditor>
      <TextEditor></TextEditor>
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
</style>