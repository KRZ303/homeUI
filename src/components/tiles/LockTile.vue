<script setup lang="ts">
import type { Entity } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { toggleIcon } from '../../stores/home'

defineProps<{ entity: Entity }>()
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none">
    <TileTopRow :entity="entity" @icon="toggleIcon(entity)" />
  </TileFrame>
</template>
