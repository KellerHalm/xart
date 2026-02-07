<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-5xl rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 class="section-title text-xl">Обрезать изображение</h2>
        <button class="text-gray-400 hover:text-white" @click="close">
          ✕
        </button>
      </div>
      <div class="p-6">
        <img
          v-if="selectedImage"
          ref="imageRef"
          :src="selectedImage"
          alt=""
          class="max-h-[400px] w-full object-contain"
        />
        <div class="mt-4 text-sm text-gray-400">
          <p class="font-semibold">Управление</p>
          <p>Тяните за углы, чтобы выбрать область</p>
          <p>
            Нажмите 2 раза на пустое место, чтобы поменять режим выбора области
            на перемещение и обратно
          </p>
          <p>спользуйте колёсико мыши, чтобы изменить масштаб</p>
        </div>
      </div>
      <div class="flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4">
        <button
          class="btn-accent rounded-lg px-4 py-2 text-sm font-semibold"
          :disabled="isActionsDisabled"
          @click="save"
        >
          Сохранить
        </button>
        <button
          class="btn-outline rounded-lg border-[#d21c22] px-4 py-2 text-sm font-semibold text-[#d21c22] hover:bg-[#d21c22]/10"
          :disabled="isActionsDisabled"
          @click="close"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

const props = defineProps<{
  isOpen: boolean;
  isActionsDisabled: boolean;
  selectedImage: string | null;
  croppedImage: string | null;
  cropParams: {
    guides?: boolean;
    width?: number;
    height?: number;
    quality?: number;
    aspectRatio?: number;
    forceAspect?: boolean;
  };
}>();

const emit = defineEmits<{
  (e: "update", value: {
    isOpen: boolean;
    isActionsDisabled: boolean;
    selectedImage: string | null;
    croppedImage: string | null;
  }): void;
}>();

const imageRef = ref<HTMLImageElement | null>(null);
let cropper: Cropper | null = null;

function destroyCropper() {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

function initCropper() {
  if (!imageRef.value) return;
  destroyCropper();
  cropper = new Cropper(imageRef.value, {
    viewMode: 1,
    guides: props.cropParams.guides ?? false,
    aspectRatio: props.cropParams.forceAspect ? props.cropParams.aspectRatio : undefined,
    autoCropArea: 1,
    responsive: true,
  });
}

function save() {
  if (!cropper) return;
  const canvas = cropper.getCroppedCanvas({
    width: props.cropParams.width,
    height: props.cropParams.height,
    maxWidth: props.cropParams.width,
    maxHeight: props.cropParams.height,
  });
  const dataUrl = canvas.toDataURL(
    "image/jpeg",
    props.cropParams.quality ? props.cropParams.quality / 100 : 1
  );
  emit("update", {
    isOpen: true,
    isActionsDisabled: false,
    selectedImage: props.selectedImage,
    croppedImage: dataUrl,
  });
}

function close() {
  emit("update", {
    isOpen: false,
    isActionsDisabled: false,
    selectedImage: null,
    croppedImage: null,
  });
}

watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      await nextTick();
      initCropper();
    } else {
      destroyCropper();
    }
  }
);

onBeforeUnmount(() => destroyCropper());
</script>

