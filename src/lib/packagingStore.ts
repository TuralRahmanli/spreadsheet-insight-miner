import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PackagingStore {
  packagingOptions: string[];
  addPackagingOption: (option: string) => void;
  removePackagingOption: (option: string) => void;
}

// Initial packaging options as requested by user
const initialPackagingOptions = [
  "40", "40+(3)", "45", "45+3", "50", "50+(3)", "55", "55+(3)",
  "60", "60+(3)", "65", "65+(3)", "70", "70+(3)", "75", "75+(3)",
  "80", "80+(3)", "85", "85+(3)", "90", "90+(3)", "95", "95+(3)",
  "100", "100+(3)", "105", "105+(3)", "110", "110+(3)", "115", "115+(3)",
  "120", "120+(3)", "125", "125+(3)", "130", "130+(3)", "135", "135+(3)",
  "140", "140+(3)", "145", "145+(3)", "150", "150+(3)", "155", "155+(3)",
  "160", "160+(3)", "165", "165+(3)"
];

export const usePackagingStore = create<PackagingStore>()(
  persist(
    (set, get) => ({
      packagingOptions: initialPackagingOptions,
      addPackagingOption: (option) => 
        set((state) => ({ 
          packagingOptions: state.packagingOptions.includes(option) 
            ? state.packagingOptions 
            : [...state.packagingOptions, option].sort((a, b) => {
              const numA = parseInt(a.split(/[+()]/)[0]);
              const numB = parseInt(b.split(/[+()]/)[0]);
              return numA - numB;
            })
        })),
      removePackagingOption: (option) =>
        set((state) => ({ 
          packagingOptions: state.packagingOptions.filter(opt => opt !== option) 
        })),
    }),
    {
      name: 'packaging-storage',
    }
  )
);