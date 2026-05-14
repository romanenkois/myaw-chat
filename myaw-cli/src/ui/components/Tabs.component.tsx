import { Box, Text, useInput } from 'ink';
import { colors } from '../colors';
import { TABS, useTabs } from '../state';

export function Tabs() {
  const { current, next, prev } = useTabs();

  useInput((_input, key) => {
    if (key.tab && key.shift) prev();
    else if (key.tab) next();
    else if (key.leftArrow) prev();
    else if (key.rightArrow) next();
  });

  return (
    <Box>
      {TABS.map((tab, i) => {
        const active = tab === current;
        return (
          <Box key={tab} marginRight={i < TABS.length - 1 ? 1 : 0}>
            <Text
              color={active ? colors.bg : colors.textDim}
              backgroundColor={active ? colors.primary : undefined}
              bold={active}
            >
              {` ${tab} `}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
