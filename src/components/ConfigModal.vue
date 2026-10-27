<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Device, Span } from '../types'
import { useHome } from '../state/home'
import AppIcon from './AppIcon.vue'

const props = defineProps<{ device: Device }>()
const emit = defineEmits<{ close: [] }>()
const { state, update, compose, unnest, isSimple } = useHome()
const pendingTarget = ref<Device | null>(null)
const expanderOptions: { id: keyof Device['expanders']; label: string; icon: string }[] = [
  { id: 'down', label: 'W dół', icon: 'ChevronDown' }, { id: 'right', label: 'W bok', icon: 'ChevronRight' }, { id: 'diagonal', label: 'Ukośnie', icon: 'ArrowDownRight' },
]
const contentOptions: { id: keyof Device['expandedContent']; label: string }[] = [
  { id: 'secondaryButtons', label: 'Przyciski' }, { id: 'secondarySlider', label: 'Dodatkowy suwak' }, { id: 'presets', label: 'Szybkie presety' },
]
const lane = computed(() => state.lanes.find((item) => item.id === props.device.column))
const others = computed(() => (lane.value?.entityIds || []).filter((id) => id !== props.device.id).map((id) => state.entities[id]))
const sizes = computed<Span[]>(() => {
  if (props.device.type === 'vertical_blind') return [{ c: 2, r: 3 }, { c: 3, r: 3 }, { c: 4, r: 3 }]
  if (['slider_light', 'rich_ac_row', 'stateful_tv'].includes(props.device.type)) return [{ c: 2, r: 1 }, { c: 2, r: 2 }, { c: 3, r: 2 }, { c: 4, r: 1 }, { c: 4, r: 2 }]
  return [{ c: 1, r: 1 }, { c: 2, r: 1 }, { c: 2, r: 2 }, { c: 3, r: 3 }, { c: 4, r: 1 }, { c: 4, r: 2 }, { c: 4, r: 3 }]
})
function combine(target: Device, mode?: 'group' | 'secondary') {
  if (compose(props.device.id, target.id, mode) === 'choice') pendingTarget.value = target
  else emit('close')
}
function escape(event: KeyboardEvent) { if (event.key === 'Escape') emit('close') }
onMounted(() => window.addEventListener('keydown', escape))
onUnmounted(() => window.removeEventListener('keydown', escape))
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="config-modal" role="dialog" aria-modal="true" :aria-labelledby="`modal-${device.id}`">
      <header class="modal-header">
        <div><h2 :id="`modal-${device.id}`">{{ device.title }}</h2><p>{{ device.matterType }} <span>{{ device.span.c }}×{{ device.span.r }}</span></p></div>
        <button class="close-button" aria-label="Zamknij" @click="emit('close')"><AppIcon name="X" /></button>
      </header>
      <div class="modal-body">
        <template v-if="!pendingTarget">
          <section class="config-section"><h3>Rozmiar kafelka na siatce (C × R)</h3><div class="size-grid"><button v-for="size in sizes" :key="`${size.c}-${size.r}`" class="pill" :class="{ active: device.span.c === size.c && device.span.r === size.r }" @click="update(device.id, { span: { ...size } })">{{ size.c }}×{{ size.r }}</button></div><small v-if="['slider_light', 'rich_ac_row', 'stateful_tv'].includes(device.type)">Suwaki wymagają min. szerokości 2× (C ≥ 2).</small></section>
          <section class="config-section"><h3>Widoczne strzałki rozwijania</h3><div class="option-grid"><button v-for="option in expanderOptions" :key="option.id" class="option-button" :class="{ active: device.expanders[option.id] }" @click="device.expanders[option.id] = !device.expanders[option.id]"><AppIcon :name="option.icon" /><span>{{ option.label }}</span></button></div></section>
          <section class="config-section"><h3>Co pokazywać po rozwinięciu</h3><div class="option-grid"><button v-for="option in contentOptions" :key="option.id" class="option-button" :class="{ active: device.expandedContent[option.id] }" @click="device.expandedContent[option.id] = !device.expandedContent[option.id]"><AppIcon :name="device.expandedContent[option.id] ? 'Check' : 'Plus'" /><span>{{ option.label }}</span></button></div></section>
          <section v-if="others.length" class="config-section"><h3>Połącz lub zagnieźdź z innym kafelkiem</h3><div class="compose-list"><button v-for="other in others" :key="other.id" class="pill" @click="combine(other)"><AppIcon name="ArrowRight" :size="14" />{{ other.title }}</button></div></section>
          <section v-if="device.nestedTiles.length" class="config-section"><h3>Zagnieżdżone kafelki</h3><div v-for="childId in device.nestedTiles" :key="childId" class="nested-manager"><span>{{ state.entities[childId].title }}</span><button @click="unnest(device.id, childId)">Wypnij z powrotem na siatkę</button></div></section>
          <section class="config-section"><h3>Stan JSON kafelka (Matter 1.6 Endpoint)</h3><pre>{{ JSON.stringify(device, null, 2) }}</pre></section>
        </template>
        <div v-else class="merge-choice">
          <AppIcon name="Combine" :size="32" />
          <h3>Połącz z „{{ pendingTarget.title }}”</h3>
          <p v-if="isSimple(device) && isSimple(pendingTarget)">Wybierz sposób sterowania tymi urządzeniami.</p>
          <button class="choice-button" @click="combine(pendingTarget, 'group')"><AppIcon name="Group" /><span><strong>Zgrupuj i steruj razem</strong><small>Zachowaj szerokość docelowego kafelka</small></span></button>
          <button class="choice-button" @click="combine(pendingTarget, 'secondary')"><AppIcon name="CirclePlus" /><span><strong>Dodaj jako przycisk dodatkowy</strong><small>Umieść sterowanie w drugim rzędzie</small></span></button>
          <button class="cancel-button" @click="pendingTarget = null">Anuluj</button>
        </div>
      </div>
    </section>
  </div>
</template>
