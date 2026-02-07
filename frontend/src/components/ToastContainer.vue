<template>
  <div class="fixed bottom-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
    <div
      v-for="toast in items"
      :key="toast.id"
      class="rounded-lg px-4 py-3 text-sm shadow-lg backdrop-blur border"
      :class="toastClass(toast.kind)"
    >
      <div class="flex items-center gap-2">
        <span v-if="toast.isLoading" class="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></span>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useToastStore } from "@/store/toast";
import type { ToastKind } from "@/store/toast";

const store = useToastStore();
const items = computed(() => store.items);

function toastClass(kind: ToastKind) {
  if (kind === "success") return "bg-emerald-600/90 text-white border-emerald-400/40";
  if (kind === "error") return "bg-[#d21c22]/90 text-white border-[#d21c22]/40";
  if (kind === "loading") return "bg-[#2b2e30]/90 text-white border-white/10";
  return "bg-[#1f2123]/90 text-white border-white/10";
}

watchEffect(() => {
  items.value.forEach((item) => {
    if (item.duration && !item.isLoading) {
      const id = item.id;
      setTimeout(() => store.remove(id), item.duration);
    }
  });
});
</script>
