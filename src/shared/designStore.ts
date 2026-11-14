import { create } from 'zustand'
import type { Design, Role } from './types'

export const emptyDesign: Design = {
  missionId: '',
  instrumentIds: [],
  powerSystemId: '',
  antennaId: '',
  fuelKg: 0,
  orbitId: '',
  rocketId: '',
  lifetimeMonths: 12,
  approvedBy: [],
}

interface DesignStore {
  design: Design
  patchDesign: (partial: Partial<Design>) => void
  setDesign: (design: Design) => void
  approve: (role: Role) => void
  resetApprovals: () => void
  reset: () => void
}

export const useDesignStore = create<DesignStore>((set) => ({
  design: emptyDesign,
  patchDesign: (partial) =>
    set((state) => ({
      design: { ...state.design, ...partial },
    })),
  setDesign: (design) => set({ design }),
  approve: (role) =>
    set((state) => ({
      design: {
        ...state.design,
        approvedBy: state.design.approvedBy.includes(role)
          ? state.design.approvedBy
          : [...state.design.approvedBy, role],
      },
    })),
  resetApprovals: () =>
    set((state) => ({
      design: { ...state.design, approvedBy: [] },
    })),
  reset: () => set({ design: emptyDesign }),
}))
