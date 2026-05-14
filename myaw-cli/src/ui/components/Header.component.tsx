import { Box, Text } from 'ink';

const LOGO = ``;

export function Header() {
  return (
    <Box>
      <Box marginRight={2}>
        <Text>{LOGO}</Text>
      </Box>
      <Box alignItems="center">
        <Text bold>tynka chat cli</Text>
      </Box>
    </Box>
  );
}
