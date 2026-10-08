<script setup lang="ts">
import { type ContextMenuItem } from '~/types/contextMenu';

const props = defineProps<{
  x: number
  y: number
  items: ContextMenuItem[]
}>()

const emit = defineEmits<{
  select: [item: ContextMenuItem]
  close: []
}>()

function select(item: Extract<ContextMenuItem, { type: "item" }>) {
  emit('select', item);
  close();
}

function close() {
  emit("close");
}
</script>

<template>
  <!-- área que ocupa a tela inteira -->
  <div
    class="position-fixed top-0 start-0 w-100 h-100 user-select-none"
    style="z-index: 1050;"
    @contextmenu.stop
    @click="close"
  >
    <!-- menu -->
    <div
      class="dropdown-menu show position-fixed"
      :style="{
        left: `${x}px`,
        top: `${y}px`
      }"
      @click.stop
    >
      <template
        v-for="(item, i) in items"
        :key="i"
      >
        <button
          v-if="item.type == 'item'"
          type="button"
          class="dropdown-item"
          @click="select(item)"
        >
          {{ item.label }}
        </button>
        <hr v-if="item.type == 'divider'" class="dropdown-divider">
      </template>
    </div>
  </div>
</template>