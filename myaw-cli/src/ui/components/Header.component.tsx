import { Box, Text } from "ink";
import { colors } from "../colors";

const LOGO = `    ▄▄▄▄            ▄▄▄▄
    ████            ████
████    ████    ████    ████
▀▀▀▀    ▀▀▀▀    ▀▀▀▀    ▀▀▀▀
    `;

export function Header() {
  return (
    <Box>
      <Box marginRight={2}>
        <Text color={colors.primary}>{LOGO}</Text>
      </Box>
      <Box>
        <Text bold color={colors.text}>
          tynka chat cli
        </Text>
      </Box>
    </Box>
  );
}
