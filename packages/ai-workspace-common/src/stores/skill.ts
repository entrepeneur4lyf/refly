import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { SkillTemplate, SkillInstance } from '@refly/openapi-schema';

export interface SkillState {
  [skillName: string]: any;
}

interface SkillManageState {
  skillInstances: SkillInstance[];
  skillTemplates: SkillTemplate[];
  isFetchingSkillInstances: boolean;
  isFetchingSkillTemplates: boolean;

  // skills states
  skillState: SkillState;

  selectedSkill: SkillInstance | null;

  // manage skill
  skillManagerModalVisible: boolean;

  setSkillState: (newState: SkillState) => void;
  setSkillInstances: (skillInstances: SkillInstance[]) => void;
  setSkillTemplates: (skillTemplates: SkillTemplate[]) => void;
  setIsFetchingSkillInstances: (isFetching: boolean) => void;
  setIsFetchingSkillTemplates: (isFetching: boolean) => void;
  setSelectedSkillInstance: (skillInstance: SkillInstance) => void;
  setSkillManagerModalVisible: (visible: boolean) => void;
  resetState: () => void;
}

export const defaultState = {
  // skills
  skillInstances: [],
  skillTemplates: [],
  isFetchingSkillInstances: false,
  isFetchingSkillTemplates: false,
  skillState: {} as SkillState,
  selectedSkill: null,
  skillManagerModalVisible: false,
};

export const useSkillStore = create<SkillManageState>()(
  devtools((set) => ({
    ...defaultState,

    // skill
    setSkillState: (newState: SkillState) => set((state) => ({ ...state, skillState: newState })),
    setSkillInstances: (skillInstances: SkillInstance[]) => set((state) => ({ ...state, skillInstances })),
    setSkillTemplates: (skillTemplates: SkillTemplate[]) => set((state) => ({ ...state, skillTemplates })),
    setIsFetchingSkillInstances: (isFetching: boolean) =>
      set((state) => ({ ...state, isFetchingSkillInstances: isFetching })),
    setIsFetchingSkillTemplates: (isFetching: boolean) =>
      set((state) => ({ ...state, isFetchingSkillTemplates: isFetching })),
    setSelectedSkillInstance: (skillInstance: SkillInstance) =>
      set((state) => ({ ...state, selectedSkill: skillInstance })),
    setSkillManagerModalVisible: (visible: boolean) =>
      set((state) => ({ ...state, skillManagerModalVisible: visible })),
    resetState: () => set((state) => ({ ...state, ...defaultState })),
  })),
);

export const useSkillStoreShallow = <T>(selector: (state: SkillManageState) => T) => {
  return useSkillStore(useShallow(selector));
};
