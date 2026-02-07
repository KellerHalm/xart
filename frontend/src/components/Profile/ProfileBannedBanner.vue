<template>
  <div
    v-if="isBanned || isPermBanned"
    class="flex w-full flex-col justify-between rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-600 dark:bg-red-700 md:flex-row"
  >
    <div class="mb-4 md:mb-0 md:me-4">
      <h2 class="mb-1 text-base font-semibold text-gray-900 dark:text-white">
        {{
          isPermBanned
            ? "Пользователь был заблокирован администрацией навсегда"
            : `Пользователь был заблокирован администрацией до ${unixToDate(banExpires, "full")}`
        }}
      </h2>
      <p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-200">
        {{ banReason }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { unixToDate } from "@/api/utils";

defineProps<{
  isBanned: boolean;
  isPermBanned: boolean;
  banReason: string;
  banExpires: number;
}>();
</script>



