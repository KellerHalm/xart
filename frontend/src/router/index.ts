import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import IndexPage from "@/pages/Index.vue";
import IndexCategoryPage from "@/pages/IndexCategory.vue";
import SearchPage from "@/pages/Search.vue";
import LoginPage from "@/pages/Login.vue";
import AboutPage from "@/pages/About.vue";
import PlaceholderPage from "@/pages/PlaceholderPage.vue";
import ReleasePage from "@/pages/Release.vue";
import BookmarksPage from "@/pages/Bookmarks.vue";
import BookmarksCategoryPage from "@/pages/BookmarksCategory.vue";
import FavoritesPage from "@/pages/Favorites.vue";
import HistoryPage from "@/pages/History.vue";
import CollectionsPage from "@/pages/Collections.vue";
import CollectionsFavoritesPage from "@/pages/CollectionsFavorites.vue";
import CollectionViewPage from "@/pages/CollectionView.vue";
import ProfilePage from "@/pages/Profile.vue";
import CollectionsCreatePage from "@/pages/CollectionsCreate.vue";
import ProfileBookmarksPage from "@/pages/ProfileBookmarks.vue";
import ProfileBookmarksCategoryPage from "@/pages/ProfileBookmarksCategory.vue";
import ProfileCollectionsPage from "@/pages/ProfileCollections.vue";
import ReleaseCollectionsPage from "@/pages/ReleaseCollections.vue";
import RelatedPage from "@/pages/Related.vue";
import DiscoveryPage from "@/pages/Discovery.vue";
import DiscoveryCollectionsPage from "@/pages/DiscoveryCollections.vue";
import DiscoveryRecommendationsPage from "@/pages/DiscoveryRecommendations.vue";
import DiscoveryWatchingPage from "@/pages/DiscoveryWatching.vue";
import DiscoveryFilterPage from "@/pages/DiscoveryFilter.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: IndexPage },
  {
    path: "/home/:slug",
    name: "home-category",
    component: IndexCategoryPage,
  },
  { path: "/search", name: "search", component: SearchPage },
  { path: "/login", name: "login", component: LoginPage },
  { path: "/about", name: "about", component: AboutPage },
  {
    path: "/discovery",
    name: "discovery",
    component: DiscoveryPage,
    meta: { title: "Обзор" },
  },
  {
    path: "/discovery/filter",
    name: "discovery-filter",
    component: DiscoveryFilterPage,
    meta: { title: "Фильтры" },
  },
  {
    path: "/discovery/collections",
    name: "discovery-collections",
    component: DiscoveryCollectionsPage,
    meta: { title: "Коллекции недели" },
  },
  {
    path: "/discovery/recommendations",
    name: "discovery-recommendations",
    component: DiscoveryRecommendationsPage,
    meta: { title: "Рекомендации" },
  },
  {
    path: "/discovery/watching",
    name: "discovery-watching",
    component: DiscoveryWatchingPage,
    meta: { title: "Смотрят сейчас" },
  },
  {
    path: "/bookmarks",
    name: "bookmarks",
    component: BookmarksPage,
    meta: { title: "Закладки" },
  },
  {
    path: "/bookmarks/:slug",
    name: "bookmarks-category",
    component: BookmarksCategoryPage,
    meta: { title: "Категория закладок" },
  },
  {
    path: "/favorites",
    name: "favorites",
    component: FavoritesPage,
    meta: { title: "Избранное" },
  },
  {
    path: "/collections",
    name: "collections",
    component: CollectionsPage,
    meta: { title: "Коллекции" },
  },
  {
    path: "/collections/create",
    name: "collections-create",
    component: CollectionsCreatePage,
    meta: { title: "Создать коллекцию" },
  },
  {
    path: "/collections/favorites",
    name: "collections-favorites",
    component: CollectionsFavoritesPage,
    meta: { title: "Избранные коллекции" },
  },
  {
    path: "/collection/:id",
    name: "collection",
    component: CollectionViewPage,
    meta: { title: "Коллекция" },
  },
  {
    path: "/release/:id",
    name: "release",
    component: ReleasePage,
    meta: { title: "Релиз" },
  },
  {
    path: "/release/:id/collections",
    name: "release-collections",
    component: ReleaseCollectionsPage,
    meta: { title: "Коллекции релиза" },
  },
  {
    path: "/related/:id",
    name: "related",
    component: RelatedPage,
    meta: { title: "Похожие" },
  },
  {
    path: "/profile/:id",
    name: "profile",
    component: ProfilePage,
    meta: { title: "Профиль" },
  },
  {
    path: "/profile/:id/bookmarks",
    name: "profile-bookmarks",
    component: ProfileBookmarksPage,
    meta: { title: "Закладки профиля" },
  },
  {
    path: "/profile/:id/bookmarks/:slug",
    name: "profile-bookmarks-category",
    component: ProfileBookmarksCategoryPage,
    meta: { title: "Категория закладок" },
  },
  {
    path: "/profile/:id/collections",
    name: "profile-collections",
    component: ProfileCollectionsPage,
    meta: { title: "Коллекции профиля" },
  },
  {
    path: "/history",
    name: "history",
    component: HistoryPage,
    meta: { title: "История" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: PlaceholderPage,
    meta: { title: "Страница не найдена" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  if (typeof to.meta?.title === "string") {
    document.title = `Xart | ${to.meta.title}`;
  } else {
    document.title = "Xart | Домашняя";
  }
});

export default router;
