import { useEffect, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';

export function App() {
  const { exit } = useApp();
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
    <Box flexDirection="column" padding={1}>
      <Text>Hello, world!</Text>
      <Box marginTop={1}>
        <Text backgroundColor="red" color="white"> Exit </Text>
        <Text dimColor>
          {confirmExit ? ' (press Escape again to confirm)' : ' (press Escape twice)'}
        </Text>
      </Box>
    </Box>
  );
}
