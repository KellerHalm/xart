<template>
  <div class="card-surface rounded-2xl p-5 sm:p-6">
    <h1 class="section-title text-xl">{{ ui.title }}</h1>
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        class="rounded-lg px-3 py-2 text-sm tab-pill"
        :class="tab === 'collections' ? 'tab-pill tab-pill-active' : 'tab-pill'"
        @click="tab = 'collections'"
      >
        {{ ui.collections }} ( {{ collectionCount }} )
      </button>
      <button
        class="rounded-lg px-3 py-2 text-sm tab-pill"
        :class="tab === 'comments' ? 'tab-pill tab-pill-active' : 'tab-pill'"
        @click="tab = 'comments'"
      >
        {{ ui.comments }} ( {{ commentCount }} )
      </button>
      <button
        class="rounded-lg px-3 py-2 text-sm tab-pill"
        :class="tab === 'friends' ? 'tab-pill tab-pill-active' : 'tab-pill'"
        @click="tab = 'friends'"
      >
        {{ ui.friends }} ( {{ friendsCount }} )
      </button>
    </div>

    <div class="mt-4">
      <ProfileActivityCollections
        v-if="tab === 'collections'"
        :content="Object.values(collections)"
        :profile-id="profileId"
      />
      <ProfileActivityComment
        v-if="tab === 'comments'"
        :content="commentPreview"
        :profile-id="profileId"
      />
      <ProfileActivityFriends
        v-if="tab === 'friends'"
        :content="friendsPreview"
        :token="token"
        :is-my-profile="isMyProfile"
        :profile-id="profileId"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import ProfileActivityCollections from "@/components/Profile/ProfileActivityCollections.vue";
import ProfileActivityComment from "@/components/Profile/ProfileActivityComment.vue";
import ProfileActivityFriends from "@/components/Profile/ProfileActivityFriends.vue";

const props = defineProps<{
  profileId: number;
  commentCount: number;
  commentPreview: any[];
  collectionCount: number;
  collectionPreview: any[];
  friendsCount: number;
  friendsPreview: any[];
  token: string | null;
  isMyProfile: boolean;
}>();

const ui = {
  title: "\u0410\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c",
  collections: "\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u0438",
  comments: "\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438",
  friends: "\u0414\u0440\u0443\u0437\u044c\u044f",
};

const tab = ref<"collections" | "comments" | "friends">("collections");
const collections = ref<Record<number, any>>({});

function setCollection(array: any[]) {
  if (!array || array.length === 0) return;
  const filtered = array.filter((col) => typeof col !== "number");
  filtered.forEach((col) => {
    collections.value[col.id] = col;
    if (col.creator?.collections_preview?.length > 0) {
      setCollection(col.creator.collections_preview);
    }
  });
}

watch(
  () => props.collectionPreview,
  (value) => {
    collections.value = {};
    setCollection(value || []);
  },
  { immediate: true }
);
</script>




