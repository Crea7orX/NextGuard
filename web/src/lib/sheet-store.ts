"use client";

import type React from "react";
import { create } from "zustand";

export type SheetSide = "top" | "right" | "bottom" | "left";

interface RenderCtx {
  close: () => void;
}

export interface SheetOptions {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  body: React.ReactNode | ((ctx: RenderCtx) => React.ReactNode);
  footer?: React.ReactNode | ((ctx: RenderCtx) => React.ReactNode);
  side?: SheetSide;
  onClose?: () => void;
}

export interface SheetState {
  isOpen: boolean;
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  body?: SheetOptions["body"];
  footer?: SheetOptions["footer"];
  side: SheetSide;
  onClose?: () => void;
}

interface SheetStore {
  state: SheetState;
  open: (opts: SheetOptions) => void;
  close: () => void;
  setId: (id?: string) => void;
  setTitle: (title?: React.ReactNode) => void;
  setDescription: (description?: React.ReactNode) => void;
  replaceBody: (body: SheetOptions["body"]) => void;
  setFooter: (footer?: SheetOptions["footer"]) => void;
  setSide: (side: SheetSide) => void;
}

export const useSheetStore = create<SheetStore>((set, get) => ({
  state: {
    isOpen: false,
    side: "right",
  },
  open: (options) =>
    set({
      state: {
        isOpen: true,
        title: options.title,
        description: options.description,
        body: options.body,
        footer: options.footer,
        side: options.side ?? "right",
        onClose: options.onClose,
      },
    }),
  close: () => {
    const { state } = get();
    state.onClose?.();
    set({ state: { ...state, isOpen: false } });
  },
  setId: (id) => set((store) => ({ state: { ...store.state, id } })),
  setTitle: (title) => set((store) => ({ state: { ...store.state, title } })),
  setDescription: (description) =>
    set((store) => ({ state: { ...store.state, description } })),
  replaceBody: (body) => set((store) => ({ state: { ...store.state, body } })),
  setFooter: (footer) =>
    set((store) => ({ state: { ...store.state, footer } })),
  setSide: (side) => set((store) => ({ state: { ...store.state, side } })),
}));

export const sheet = {
  open: (options: SheetOptions) => useSheetStore.getState().open(options),
  close: () => useSheetStore.getState().close(),
  setId: (id?: string) => useSheetStore.getState().setId(id),
  setTitle: (title?: React.ReactNode) =>
    useSheetStore.getState().setTitle(title),
  setDescription: (description?: React.ReactNode) =>
    useSheetStore.getState().setDescription(description),
  replaceBody: (body: SheetOptions["body"]) =>
    useSheetStore.getState().replaceBody(body),
  setFooter: (footer?: SheetOptions["footer"]) =>
    useSheetStore.getState().setFooter(footer),
  setSide: (side: SheetSide) => useSheetStore.getState().setSide(side),
};
