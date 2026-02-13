import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const IndexPage = () => import("@/pages/Index.vue");
const IndexCategoryPage = () => import("@/pages/IndexCategory.vue");
const SearchPage = () => import("@/pages/Search.vue");
const LoginPage = () => import("@/pages/Login.vue");
const AboutPage = () => import("@/pages/About.vue");
const PlaceholderPage = () => import("@/pages/PlaceholderPage.vue");
const ReleasePage = () => import("@/pages/Release.vue");
const BookmarksPage = () => import("@/pages/Bookmarks.vue");
const BookmarksCategoryPage = () => import("@/pages/BookmarksCategory.vue");
const FavoritesPage = () => import("@/pages/Favorites.vue");
const HistoryPage = () => import("@/pages/History.vue");
const CollectionsPage = () => import("@/pages/Collections.vue");
const CollectionsFavoritesPage = () => import("@/pages/CollectionsFavorites.vue");
const CollectionViewPage = () => import("@/pages/CollectionView.vue");
const ProfilePage = () => import("@/pages/Profile.vue");
const CollectionsCreatePage = () => import("@/pages/CollectionsCreate.vue");
const ProfileBookmarksPage = () => import("@/pages/ProfileBookmarks.vue");
const ProfileBookmarksCategoryPage = () => import("@/pages/ProfileBookmarksCategory.vue");
const ProfileCollectionsPage = () => import("@/pages/ProfileCollections.vue");
const ReleaseCollectionsPage = () => import("@/pages/ReleaseCollections.vue");
const RelatedPage = () => import("@/pages/Related.vue");
const DiscoveryPage = () => import("@/pages/Discovery.vue");
const DiscoveryCollectionsPage = () => import("@/pages/DiscoveryCollections.vue");
const DiscoveryRecommendationsPage = () => import("@/pages/DiscoveryRecommendations.vue");
const DiscoveryWatchingPage = () => import("@/pages/DiscoveryWatching.vue");
const DiscoveryFilterPage = () => import("@/pages/DiscoveryFilter.vue");

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
