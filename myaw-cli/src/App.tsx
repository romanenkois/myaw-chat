import { useEffect, useState } from "react";
import { Box, Text, useApp, useInput, useWindowSize } from "ink";
import { Home } from "./ui/pages";
import { Header } from "./ui/components";

export function App() {
  const { exit } = useApp();
  const { rows, columns } = useWindowSize();
  const [confirmExit, setConfirmExit] = useState(false);

  useInput((_input, key) => {
    if (key.escape) {
      if (confirmExit) {
        exit();
      } else {
        setConfirmExit(true);
      }
    }
  });

  useEffect(() => {
    if (!confirmExit) return;
    const timer = setTimeout(() => setConfirmExit(false), 2000);
    return () => clearTimeout(timer);
  }, [confirmExit]);

  return (
    <Box flexDirection="column" height={rows} width={columns} padding={1}>
      <Box>
        <Header />
      </Box>
      <Box>
        <Text>{'─'.repeat(Math.max(0, columns - 2))}</Text>
      </Box>
      <Box flexGrow={1} marginTop={1}>
        <Home />
      </Box>
      <Box>
        <Text backgroundColor="red" color="white">
          {" "}
          Exit{" "}
        </Text>
        <Text dimColor>
          {confirmExit
            ? " (press Escape again to confirm)"
            : " (press Escape twice)"}
        </Text>
      </Box>
    </Box>
  );
}
