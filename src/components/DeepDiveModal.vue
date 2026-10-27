<script setup lang="ts">
import { computed } from 'vue';
import { useHomeStore } from '../store';

const store = useHomeStore();

const ent = computed(() => {
  const id = store.modalEntityId.value;
  return id ? store.entities[id] : null;
});

const spanOptions = computed(() => {
  const e = ent.value;
  if (!e) return [];
  if (e.type === 'vertical_blind')
    return [
      { c: 2, r: 3 },
      { c: 3, r: 3 },
      { c: 4, r: 3 },
    ];
  if (e.type === 'slider_light' || e.type === 'rich_ac_row' || e.type === 'stateful_tv')
    return [
      { c: 2, r: 1 },
      { c: 2, r: 2 },
      { c: 3, r: 2 },
      { c: 4, r: 1 },
      { c: 4, r: 2 },
    ];
  return [
    { c: 1, r: 1 },
    { c: 2, r: 1 },
    { c: 2, r: 2 },
    { c: 3, r: 3 },
    { c: 4, r: 1 },
    { c: 4, r: 2 },
    { c: 4, r: 3 },
  ];
});

const sliderBased = computed(() => {
  const t = ent.value?.type;
  return t === 'slider_light' || t === 'rich_ac_row' || t === 'stateful_tv';
});

const otherEntities = computed(() => {
  const e = ent.value;
  if (!e) return [];
  const lane = store.lanes.find((l) => l.entityIds.includes(e.id));
  return (lane?.entityIds ?? []).filter((id) => id !== e.id).map((id) => store.entities[id]);
});
</script>

<template>
  <div
    v-if="ent"
    class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
    @pointerdown.self="store.closeModal"
  >
    <div class="w-full max-w-lg bg-[#252525] rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
      <div class="bg-[#2C2C2C] px-6 py-4 flex items-center justify-between">
        <div class="min-w-0">
          <div class="text-base font-bold text-white truncate">{{ ent.title }}</div>
          <div class="text-[11px] text-white/50 truncate">{{ ent.matterType ?? ent.type }} • {{ ent.span.c }}×{{ ent.span.r }}</div>
        </div>
        <button class="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-white/80 flex items-center justify-center" @click="store.closeModal">
          ✕
        </button>
      </div>

      <div class="px-6 py-4 space-y-5 overflow-y-auto">
        <!-- Grid footprint selector -->
        <section>
          <div class="text-xs font-semibold text-white/80 mb-2">Rozmiar kafelka na siatce (C × R)</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in spanOptions"
              :key="`${opt.c}-${opt.r}`"
              class="h-9 px-3.5 rounded-full text-xs font-semibold transition-colors"
              :class="ent.span.c === opt.c && ent.span.r === opt.r ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.08] text-white/85 hover:bg-white/[0.16]'"
              @click="store.setSpan(ent.id, opt)"
            >
              {{ opt.c }}×{{ opt.r }}
            </button>
          </div>
          <div v-if="sliderBased" class="text-[11px] text-white/45 mt-1.5">• Suwaki wymagają min. szerokości 2× (C ≥ 2)</div>
        </section>

        <!-- Expander visibility -->
        <section>
          <div class="text-xs font-semibold text-white/80 mb-2">Widoczne strzałki rozwijania na kafelku</div>
          <div class="grid grid-cols-3 gap-2">
            <button
              class="h-16 rounded-2xl px-3 text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors"
              :class="ent.expanders.down ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.12]'"
              @click="ent.expanders.down = !ent.expanders.down"
            >
              <span class="text-base">↓</span>
              <span class="opacity-80">W dół</span>
              <span class="text-[10px] opacity-60">Środek na dole</span>
            </button>
            <button
              class="h-16 rounded-2xl px-3 text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors"
              :class="ent.expanders.right ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.12]'"
              @click="ent.expanders.right = !ent.expanders.right"
            >
              <span class="text-base">→</span>
              <span class="opacity-80">W bok</span>
              <span class="text-[10px] opacity-60">Środek po prawej</span>
            </button>
            <button
              class="h-16 rounded-2xl px-3 text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors"
              :class="ent.expanders.diagonal ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.12]'"
              @click="ent.expanders.diagonal = !ent.expanders.diagonal"
            >
              <span class="text-base">↘</span>
              <span class="opacity-80">Ukośnie</span>
              <span class="text-[10px] opacity-60">Prawy dolny róg</span>
            </button>
          </div>
        </section>

        <!-- Expanded content toggles -->
        <section>
          <div class="text-xs font-semibold text-white/80 mb-2">Co pokazywać po rozwinięciu kafelka</div>
          <div class="grid grid-cols-3 gap-2">
            <button
              class="h-14 rounded-2xl px-3 flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors"
              :class="ent.expandedContent.secondaryButtons ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.12]'"
              @click="ent.expandedContent.secondaryButtons = !ent.expandedContent.secondaryButtons"
            >
              <span>Przyciski dodatkowe</span>
              <span class="text-[10px] opacity-60">Secondary buttons</span>
            </button>
            <button
              class="h-14 rounded-2xl px-3 flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors"
              :class="ent.expandedContent.secondarySlider ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.12]'"
              @click="ent.expandedContent.secondarySlider = !ent.expandedContent.secondarySlider"
            >
              <span>Dodatkowy suwak</span>
              <span class="text-[10px] opacity-60">Barwa K / Nawiew</span>
            </button>
            <button
              class="h-14 rounded-2xl px-3 flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors"
              :class="ent.expandedContent.presets ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.12]'"
              @click="ent.expandedContent.presets = !ent.expandedContent.presets"
            >
              <span>Szybkie presety</span>
              <span class="text-[10px] opacity-60">Tryby Eco / Komfort</span>
            </button>
          </div>
        </section>

        <!-- Quick composition -->
        <section v-if="otherEntities.length > 0">
          <div class="text-xs font-semibold text-white/80 mb-2">Połącz lub zagnieźdź z innym kafelkiem w tym pokoju</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="other in otherEntities"
              :key="other.id"
              class="h-9 px-3.5 rounded-full text-xs font-semibold bg-white/[0.08] hover:bg-[#73B7B2] hover:text-[#182C2A] text-white/85 transition-colors"
              @click="store.handleDropTileOnTile(ent.id, other.id); store.closeModal()"
            >
              → {{ other.title }}
            </button>
          </div>
        </section>

        <!-- Nested tiles manager -->
        <section v-if="ent.nestedTiles.length > 0">
          <div class="text-xs font-semibold text-white/80 mb-2">Zagnieżdżone kafelki</div>
          <div class="space-y-2">
            <div
              v-for="nestedId in ent.nestedTiles"
              :key="nestedId"
              class="bg-white/[0.05] px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-2"
            >
              <span class="text-xs font-semibold text-white/85 truncate">{{ store.entities[nestedId]?.title ?? nestedId }}</span>
              <button class="text-xs text-[#73B7B2] hover:underline shrink-0" @click="store.unnestTile(ent.id, nestedId)">
                Wypnij z powrotem na siatkę
              </button>
            </div>
          </div>
        </section>

        <!-- Live Matter JSON inspector -->
        <section>
          <div class="text-xs font-semibold text-white/80 mb-2">Stan JSON kafelka (Matter 1.6 Endpoint)</div>
          <pre class="bg-[#181818] p-3.5 rounded-2xl text-[11px] font-mono text-teal-200/90 overflow-x-auto max-h-64">{{ JSON.stringify(ent, null, 2) }}</pre>
        </section>
      </div>
    </div>
  </div>
</template>
