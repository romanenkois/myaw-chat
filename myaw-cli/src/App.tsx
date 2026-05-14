import { Box, Text, useWindowSize } from "ink";
import { Home, Statuses, Consoles } from "./ui/pages";
import { Header, Tabs, Footer } from "./ui/components";
import { colors } from "./ui/colors";
import { TabsProvider, useTabs, type Tab } from "./ui/state";

const PAGES: Record<Tab, () => React.ReactElement> = {
  home: Home,
  statuses: Statuses,
  consoles: Consoles,
};

export function App() {
  return (
    <TabsProvider>
      <AppShell />
    </TabsProvider>
  );
}

function AppShell() {
  const { rows, columns } = useWindowSize();
  const { current } = useTabs();

  const Page = PAGES[current];

  return (
    <Box flexDirection="column" height={rows} width={columns} padding={1}>
      <Box>
        <Header />
      </Box>
      <Box marginTop={1}>
        <Tabs />
      </Box>
      <Box>
        <Text color={colors.border}>
          {"─".repeat(Math.max(0, columns - 2))}
        </Text>
      </Box>
      <Box flexGrow={1} marginTop={1}>
        <Page />
      </Box>
      <Footer />
    </Box>
  );
}
