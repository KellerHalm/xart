import { defineStore } from "pinia";
import { ENDPOINTS } from "@/api/config";
import { fetchDataViaGet, getJWT, removeJWT } from "@/api/utils";

type UserState = {
  _hasHydrated: boolean;
  isAuth: boolean;
  user: any | null;
  token: string | null;
  state: "loading" | "finished";
};

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    _hasHydrated: false,
    isAuth: false,
    user: null,
    token: null,
    state: "loading",
  }),
  actions: {
    login(user: any, token: string) {
      this.isAuth = true;
      this.user = user;
      this.token = token;
      this.state = "finished";
      this._hasHydrated = true;
    },
    logout() {
      this.isAuth = false;
      this.user = null;
      this.token = null;
      this.state = "finished";
      this._hasHydrated = true;
      removeJWT();
    },
    async checkAuth() {
      const jwt = getJWT();
      if (jwt) {
        const { data, error } = await fetchDataViaGet(
          `${ENDPOINTS.user.profile}/${jwt.user_id}?token=${jwt.jwt}`
        );

        if (error || !data?.is_my_profile) {
          this.logout();
          return;
        }

        this.login(data.profile, jwt.jwt);
        return;
      }
      this.logout();
    },
  },
});
