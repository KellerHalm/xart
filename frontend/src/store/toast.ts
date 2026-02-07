import { defineStore } from "pinia";

export type ToastKind = "info" | "success" | "error" | "loading";

export type ToastItem = {
  id: number;
  message: string;
  kind: ToastKind;
  isLoading: boolean;
  duration?: number;
};

let toastId = 0;

export const useToastStore = defineStore("toast", {
  state: () => ({
    items: [] as ToastItem[],
  }),
  actions: {
    add(item: ToastItem) {
      this.items.push(item);
    },
    update(id: number, data: Partial<ToastItem>) {
      const index = this.items.findIndex((item) => item.id === id);
      if (index === -1) return;
      const current = this.items[index];
      if (!current) return;
      this.items[index] = {
        ...current,
        ...data,
        id: current.id,
        message: data.message ?? current.message,
        kind: data.kind ?? current.kind,
        isLoading: data.isLoading ?? current.isLoading,
      };
    },
    remove(id: number) {
      this.items = this.items.filter((item) => item.id !== id);
    },
  },
});

export const toast = {
  loading(message: string, opts?: { duration?: number }) {
    const store = useToastStore();
    const id = ++toastId;
    store.add({
      id,
      message,
      kind: "loading",
      isLoading: true,
      duration: opts?.duration,
    });
    return id;
  },
  update(
    id: number,
    opts: { render?: string; type?: ToastKind; autoClose?: number; isLoading?: boolean }
  ) {
    const store = useToastStore();
    store.update(id, {
      message: opts.render ?? "",
      kind: opts.type ?? "info",
      isLoading: opts.isLoading ?? false,
      duration: opts.autoClose,
    });
    if (opts.autoClose) {
      setTimeout(() => store.remove(id), opts.autoClose);
    }
  },
  error(message: string, opts?: { autoClose?: number }) {
    const store = useToastStore();
    const id = ++toastId;
    store.add({
      id,
      message,
      kind: "error",
      isLoading: false,
      duration: opts?.autoClose,
    });
    if (opts?.autoClose) {
      setTimeout(() => store.remove(id), opts.autoClose);
    }
    return id;
  },
};
