<template>
  <div class="rounded-xl border border-white/5 bg-[#222426] p-4 shadow">
    <Swiper
      :modules="[Navigation, Pagination, Autoplay]"
      :space-between="8"
      :slides-per-view="2"
      :autoplay="true"
      :pagination="true"
      :breakpoints="{ 1024: { slidesPerView: 1 } }"
      class="w-full"
    >
      <SwiperSlide v-for="(image, index) in images" :key="`release-screenshot-${index}`">
        <img :src="image" alt="" class="h-full w-full object-cover" />
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

defineProps<{ images: string[] }>();
</script>
