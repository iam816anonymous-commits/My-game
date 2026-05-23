import { create } from 'zustand';

interface TransientState {
  companionPosition: { x: number; y: number };
  setCompanionPosition: (x: number, y: number) => void;
}

export const useTransientStore = create<TransientState>((set) => ({
  companionPosition: { x: 400, y: 300 },
  setCompanionPosition: (x, y) => set({
    companionPosition: { x, y }
  }),
}));
