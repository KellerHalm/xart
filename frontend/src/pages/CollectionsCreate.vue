<template>
  <div class="space-y-4">
    <div class="card-surface rounded-xl p-4">
      <p class="section-title text-xl">
        {{ editMode ? "Редактирование коллекции" : "Создание коллекции" }}
      </p>
      <form class="mt-4 flex flex-col gap-4 lg:flex-row" @submit.prevent="submit">
        <label
          class="flex h-[337px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-[#1f2123] hover:bg-[#232629]"
        >
          <div class="flex h-[inherit] w-full max-w-[595px] items-center justify-center overflow-hidden rounded-[inherit]">
            <template v-if="!imageUrl">
              <div class="flex flex-col items-center gap-2 text-center">
                <span class="iconify mdi--cloud-upload-outline h-8 w-8 text-gray-400"></span>
                <p class="text-sm text-gray-400">
                  Нажмите для загрузки или перетащите файл
                </p>
                <p class="text-xs text-gray-400">PNG или JPG (Макс. 600x337)</p>
              </div>
            </template>
            <img v-else :src="imageUrl" class="h-[inherit] w-[inherit] object-cover" alt="" />
          </div>
          <input
            type="file"
            class="hidden"
            accept="image/jpg, image/jpeg, image/png"
            @change="handleImagePreview"
          />
        </label>

        <div class="flex-1 space-y-3">
          <div>
            <label class="mb-2 block text-sm font-medium">Название (минимум 10, максимум 60 символов)</label>
            <input
              v-model="collectionInfo.title"
              class="input-dark w-full rounded-lg px-3 py-2 text-sm"
              maxlength="60"
              required
              @input="updateLength('title')"
            />
            <p class="text-sm text-gray-400">{{ stringLength.title }}/60</p>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Описание (максимум 1000 символов)</label>
            <textarea
              v-model="collectionInfo.description"
              class="input-dark w-full rounded-lg px-3 py-2 text-sm"
              rows="4"
              maxlength="1000"
              @input="updateLength('description')"
            ></textarea>
            <p class="text-sm text-gray-400">{{ stringLength.description }}/1000</p>
          </div>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" class="h-4 w-4" v-model="isPrivate" />
            Приватная коллекция
          </label>
          <button
            type="submit"
            class="btn-accent rounded-lg px-4 py-2 text-sm font-semibold"
            :disabled="isSending"
          >
            {{ editMode ? "Обновить" : "Создать" }}
          </button>
        </div>
      </form>
    </div>

    <div class="card-surface rounded-xl p-4">
      <div class="flex items-center justify-between border-b border-white/10 pb-2">
        <h2 class="section-title text-lg">
          Релизов в коллекции: {{ addedReleases.length }}/100
        </h2>
        <button
          class="btn-accent rounded-lg px-3 py-1 text-sm font-semibold"
          @click="releasesModalOpen = true"
        >
          Добавить
        </button>
      </div>
      <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <div v-for="release in addedReleases" :key="release.id" class="relative group">
          <button
            class="absolute inset-0 z-30 rounded-xl bg-black/70 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
            @click="removeRelease(release)"
          >
            Удалить
          </button>
          <PosterWithStuff v-bind="release" :settings="{ showDescription: false }" />
        </div>
      </div>
    </div>

    <ReleasesEditModal
      :is-open="releasesModalOpen"
      :releases="addedReleases"
      :releases-ids="addedReleasesIds"
      @close="releasesModalOpen = false"
      @update="handleReleasesUpdate"
    />

    <CropModal
      :is-open="imageModalProps.isOpen"
      :is-actions-disabled="imageModalProps.isActionsDisabled"
      :selected-image="imageModalProps.selectedImage"
      :cropped-image="imageModalProps.croppedImage"
      :crop-params="{ aspectRatio: 600 / 337, forceAspect: true, guides: true, width: 600, height: 337 }"
      @update="setImageModalProps"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { b64toBlob, tryCatchAPI } from "@/api/utils";
import { useUserStore } from "@/store/auth";
import { toast } from "@/store/toast";
import PosterWithStuff from "@/components/ReleasePoster/PosterWithStuff.vue";
import ReleasesEditModal from "@/components/Collections/ReleasesEditModal.vue";
import CropModal from "@/components/CropModal.vue";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const editMode = ref(false);
const isPrivate = ref(false);
const collectionInfo = ref({ title: "", description: "" });
const stringLength = ref({ title: 0, description: 0 });
const addedReleases = ref<any[]>([]);
const addedReleasesIds = ref<number[]>([]);
const releasesModalOpen = ref(false);

const imageModalProps = ref({
  isOpen: false,
  isActionsDisabled: false,
  selectedImage: null as string | null,
  croppedImage: null as string | null,
});
const imageUrl = ref<string | null>(null);

const collectionId = ref<string | null>(null);
const mode = ref<string | null>(null);
const isSending = ref(false);

function setImageModalProps(next: any) {
  imageModalProps.value = { ...next };
}

function handleReleasesUpdate(releases: any[], ids: number[]) {
  addedReleases.value = releases;
  addedReleasesIds.value = ids;
}

function updateLength(field: "title" | "description") {
  stringLength.value[field] = collectionInfo.value[field].length;
}

function handleImagePreview(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onloadend = () => {
    imageModalProps.value = {
      ...imageModalProps.value,
      isOpen: true,
      selectedImage: reader.result as string,
    };
    target.value = "";
  };
  reader.readAsDataURL(file);
}

function removeRelease(release: any) {
  addedReleases.value = addedReleases.value.filter((item) => item.id !== release.id);
  addedReleasesIds.value = addedReleasesIds.value.filter((id) => id !== release.id);
}

async function loadCollection() {
  if (!mode.value || mode.value !== "edit" || !collectionId.value || !userStore.token) return;
  isSending.value = true;
  const res = await fetch(
    `${ENDPOINTS.collection.base}/${collectionId.value}?token=${userStore.token}`
  );
  const data = await res.json();

  const collectedIds: number[] = [];
  const collectedReleases: any[] = [];

  for (let i = 0; i < 4; i++) {
    const relRes = await fetch(
      `${ENDPOINTS.collection.base}/${collectionId.value}/releases/${i}?token=${userStore.token}`
    );
    const relData = await relRes.json();
    if (relData.content?.length > 0) {
      relData.content.forEach((release: any) => {
        if (!collectedIds.includes(release.id)) {
          collectedIds.push(release.id);
          collectedReleases.push(release);
        }
      });
    } else {
      break;
    }
  }

  if (userStore.user?.id === data.collection.creator.id) {
    editMode.value = true;
    collectionInfo.value = {
      title: data.collection.title,
      description: data.collection.description,
    };
    stringLength.value = {
      title: data.collection.title.length,
      description: data.collection.description.length,
    };
    isPrivate.value = data.collection.is_private;
    imageUrl.value = data.collection.image;
    addedReleases.value = collectedReleases;
    addedReleasesIds.value = collectedIds;
  }

  isSending.value = false;
}

async function submit() {
  if (collectionInfo.value.title.length < 10) {
    toast.error("Необходимо ввести название коллекции не менее 10 символов", { autoClose: 2500 });
    return;
  }
  if (addedReleasesIds.value.length < 1) {
    toast.error("Необходимо добавить хотя бы один релиз в коллекцию", { autoClose: 2500 });
    return;
  }
  if (!userStore.token) return;

  isSending.value = true;
  const tid = toast.loading(editMode.value ? "Редактируем коллекцию..." : "Создаём коллекцию...");

  const url =
    editMode.value && collectionId.value
      ? `${ENDPOINTS.collection.edit}/${collectionId.value}?token=${userStore.token}`
      : `${ENDPOINTS.collection.create}?token=${userStore.token}`;

  const { data, error } = await tryCatchAPI(
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...collectionInfo.value,
        is_private: isPrivate.value,
        private: isPrivate.value,
        releases: addedReleasesIds.value,
      }),
    })
  );

  if (error) {
    const errCode = "code" in error ? error.code : undefined;
    toast.update(tid, {
      render: `Ошибка: ${error.message}, code: ${errCode ?? "unknown"}`,
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    isSending.value = false;
    return;
  }

  if (imageUrl.value && !imageUrl.value.startsWith("http")) {
    const block = imageUrl.value.split(";");
    const contentType = block[0]?.split(":")[1];
    const rawPayload = block[1]?.split(",")[1];
    if (!contentType || !rawPayload) {
      isSending.value = false;
      return;
    }
    const blob = b64toBlob(rawPayload, contentType);
    const formData = new FormData();
    formData.append("image", blob, "cropped.jpg");
    formData.append("name", "image");

    const tiid = toast.loading(`Обновление обложки коллекции ${collectionInfo.value.title}...`);
    const { error: imageError } = await tryCatchAPI(
      fetch(`${ENDPOINTS.collection.editImage}/${data.collection.id}?token=${userStore.token}`, {
        method: "POST",
        body: formData,
      })
    );
    toast.update(tiid, {
      render: imageError ? "Не удалось обновить постер коллекции" : "Постер коллекции обновлён",
      type: imageError ? "error" : "success",
      autoClose: 2500,
      isLoading: false,
    });
  }

  toast.update(tid, {
    render: editMode.value
      ? `Коллекция ${collectionInfo.value.title} обновлена`
      : `Коллекция ${collectionInfo.value.title} создана`,
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });

  router.push(`/collection/${data.collection.id}`);
  isSending.value = false;
}

watch(
  () => imageModalProps.value.croppedImage,
  (value) => {
    if (value) {
      imageUrl.value = value;
      imageModalProps.value = {
        isOpen: false,
        isActionsDisabled: false,
        selectedImage: null,
        croppedImage: null,
      };
    }
  }
);

onMounted(() => {
  if (userStore.state === "finished" && !userStore.token) {
    router.push("/login?redirect=/collections/create");
    return;
  }
  collectionId.value = (route.query.id as string) || null;
  mode.value = (route.query.mode as string) || null;
  if (userStore.user) {
    loadCollection();
  }
});

watch(
  () => userStore.user,
  () => {
    if (userStore.user) {
      loadCollection();
    }
  }
);
</script>

