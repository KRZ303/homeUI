<script setup lang="ts">
import * as Lucide from 'lucide-vue-next';
import { computed, resolveComponent, type Component } from 'vue';
import MdiIcon from './MdiIcon.vue';

const props = defineProps<{
  iconType?: 'lucide' | 'mdi';
  icon?: string;
  iconClass?: string;
}>();

const displayName = computed(() => {
  if (props.iconType === 'mdi' && props.icon === 'ev-car') return 'Car';
  return props.icon ?? '';
});

const lucide = computed<Component | undefined>(() => {
  if (props.iconType === 'mdi') return undefined;
  const name = displayName.value;
  if (!name) return undefined;
  const comp = (Lucide as unknown as Record<string, Component>)[name];
  if (comp) return comp;
  return resolveComponent(name) as Component;
});
</script>

<template>
  <MdiIcon v-if="iconType === 'mdi'" :name="icon ?? 'table-lamp'" :class="iconClass" />
  <component :is="lucide" v-else :class="iconClass" />
</template>
