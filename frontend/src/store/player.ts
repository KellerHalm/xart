import { defineStore } from "pinia";

type PlayerState = {
  voiceover: Record<number, string>;
  player: Record<number, string>;
};

export const useUserPlayerPreferencesStore = defineStore("player-preferences", {
  state: (): PlayerState => ({
    voiceover: {},
    player: {},
  }),
  actions: {
    getPreferredVoiceover(id: number) {
      return this.voiceover[id];
    },
    setPreferredVoiceover(id: number, voiceover: string) {
      this.voiceover = { ...this.voiceover, [id]: voiceover };
    },
    getPreferredPlayer(id: number) {
      return this.player[id];
    },
    setPreferredPlayer(id: number, player: string) {
      this.player = { ...this.player, [id]: player };
    },
  },
  persist: {
    key: "player-preferences",
    storage: localStorage,
  },
});
