<template>
  <div class="flex min-h-screen items-center justify-center">
    <Spinner />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Spinner from "@/components/Spinner.vue";

const route = useRoute();
const router = useRouter();

const profileId = computed(() => Number(route.params.id));

function redirectToDefaultTab() {
  if (!profileId.value) return;
  router.replace(`/profile/${profileId.value}/bookmarks/favorite`);
}

onMounted(() => {
  redirectToDefaultTab();
});

watch(
  () => route.params.id,
  () => {
    redirectToDefaultTab();
  }
);
</script>
