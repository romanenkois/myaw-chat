import { useEffect, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { colors } from '@styles';

export function Footer() {
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
    <Box justifyContent="flex-end">
      <Text color={confirmExit ? colors.text : colors.textDim}>
        {confirmExit ? (
          <>
            {' '}
            to exit press Escape <Text underline>again</Text>
          </>
        ) : (
          <> to exit press Escape twice</>
        )}
      </Text>
    </Box>
  );
}
