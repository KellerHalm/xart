<template>
  <div class="max-w-full">
    <Swiper
      :modules="[Navigation, Mousewheel, Scrollbar]"
      :space-between="8"
      :slides-per-view="'auto'"
      direction="horizontal"
      :mousewheel="{ enabled: true, sensitivity: 4 }"
      :scrollbar="{ enabled: true, draggable: true }"
      :style="{ '--swiper-scrollbar-bottom': '0' }"
    >
      <SwiperSlide
        v-for="collection in content"
        :key="`col-prev-${collection.id}`"
        class="w-fit"
      >
        <div class="w-[350px] xl:w-[500px] aspect-video">
          <CollectionLink :collection="collection" />
        </div>
      </SwiperSlide>

      <SwiperSlide v-if="content && content.length > 0" class="w-fit">
        <router-link :to="`/profile/${profileId}/collections`">
          <div
            class="card-surface flex aspect-video w-[350px] flex-col items-center justify-center gap-2 text-gray-200 xl:w-[500px]"
          >
            <span class="iconify mdi--arrow-right h-8 w-8"></span>
            <p>Все коллекции</p>
          </div>
        </router-link>
      </SwiperSlide>
    </Swiper>
    <p v-if="!content || content.length === 0" class="text-lg text-gray-400">
      У пользователя нет коллекций
    </p>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Mousewheel, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/mousewheel";
import "swiper/css/scrollbar";
import CollectionLink from "@/components/CollectionLink.vue";

defineProps<{
  content: any[];
  profileId: number;
}>();
</script>



