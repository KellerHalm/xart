<template>
  <div class="flex min-h-screen items-center justify-center">
    <Spinner />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/auth";
import Spinner from "@/components/Spinner.vue";

const router = useRouter();
const userStore = useUserStore();

function redirectToDefaultTab() {
  if (userStore.state !== "finished") return;

  if (!userStore.token) {
    router.replace("/login?redirect=/bookmarks/favorite");
    return;
  }

  router.replace("/bookmarks/favorite");
}

onMounted(() => {
  redirectToDefaultTab();
});

watch(
  () => userStore.state,
  () => {
    redirectToDefaultTab();
  }
);
</script>
