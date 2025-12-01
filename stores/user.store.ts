import { RoleAccessLevel } from "@/types";
import { create } from "zustand";

type User = {
  id: string;
  name: string;
  accessLevel: RoleAccessLevel;
  schoolId: string;
  schoolSlug: string;
};

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  isLoaded: boolean;
  setLoaded: (val: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoaded: false,

  setUser: (user: User) => set({ user }),
  setLoaded: (val: boolean) => set({ isLoaded: val }),
}));
