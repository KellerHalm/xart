<template>
  <div class="card-surface rounded-2xl p-5 sm:p-6">
    <h1 class="section-title text-xl">РђРєС‚РёРІРЅРѕСЃС‚СЊ</h1>
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        class="rounded-lg px-3 py-2 text-sm tab-pill"
        :class="tab === 'collections' ? 'tab-pill tab-pill-active' : 'tab-pill'"
        @click="tab = 'collections'"
      >
        РљРѕР»Р»РµРєС†РёРё ( {{ collectionCount }} )
      </button>
      <button
        class="rounded-lg px-3 py-2 text-sm tab-pill"
        :class="tab === 'comments' ? 'tab-pill tab-pill-active' : 'tab-pill'"
        @click="tab = 'comments'"
      >
        РљРѕРјРјРµРЅС‚Р°СЂРёРё ( {{ commentCount }} )
      </button>
      <button
        class="rounded-lg px-3 py-2 text-sm tab-pill"
        :class="tab === 'friends' ? 'tab-pill tab-pill-active' : 'tab-pill'"
        @click="tab = 'friends'"
      >
        Р”СЂСѓР·СЊСЏ ( {{ friendsCount }} )
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





