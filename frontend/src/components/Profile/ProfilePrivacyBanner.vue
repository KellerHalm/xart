<template>
  <div
    v-if="isPrivacy"
    class="flex w-full flex-col justify-between rounded-md border p-4 md:flex-row"
    :class="
      !isMeBlocked
        ? 'border-white/10 bg-[#1f2123]'
        : 'border-[#d21c22]/40 bg-[#2a1718]'
    "
  >
    <div class="mb-4 md:mb-0 md:me-4">
      <p class="flex items-center text-sm font-normal text-gray-300">
        {{
          !isMeBlocked
            ? "У пользователя установлены настройки приватности. Некоторая информация для вас может быть недоступна."
            : "Вы заблокированы данным пользователем. Его информация для вас не доступна."
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isPrivacy: boolean;
  isMeBlocked: boolean;
}>();
</script>



