import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isOpen: boolean
  isCollapsed: boolean
  toggle: () => void
  open: () => void
  close: () => void
  toggleCollapse: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: false,
      isCollapsed: false,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggleCollapse: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    { name: 'fintrack-sidebar' }
  )
)
