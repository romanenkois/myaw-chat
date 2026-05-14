import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export const TABS = ['home', 'statuses', 'consoles'] as const;
export type Tab = (typeof TABS)[number];

type TabsContextValue = {
  current: Tab;
  setCurrent: (tab: Tab) => void;
  next: () => void;
  prev: () => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function TabsProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Tab>('home');

  const value = useMemo<TabsContextValue>(() => {
    const indexOf = (tab: Tab) => TABS.indexOf(tab);
    const at = (i: number) => TABS[(i + TABS.length) % TABS.length] as Tab;
    return {
      current,
      setCurrent,
      next: () => setCurrent((c) => at(indexOf(c) + 1)),
      prev: () => setCurrent((c) => at(indexOf(c) - 1)),
    };
  }, [current]);

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be used within <TabsProvider>');
  return ctx;
}
