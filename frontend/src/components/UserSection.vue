<template>
  <section>
    <div v-if="title" class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
      <h2 class="section-title text-base sm:text-xl">{{ title }}</h2>
    </div>
    <div class="m-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <router-link
        v-for="user in content"
        :key="user.id"
        :to="`/profile/${user.id}`"
        class="card-surface rounded-xl p-4"
      >
        <div class="flex items-center gap-4">
          <img :src="user.avatar" alt="" class="h-12 w-12 rounded-full object-cover" />
          <p class="truncate text-lg font-medium text-gray-100">
            {{ user.login }}
          </p>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  content: any[];
}>();
</script>
