export const colors = {
  text: '#e6e6e6',
  textDim: '#8a8a8a',
  border: '#3a3a3a',

  primary: '#18ccb7',
  accent: '#08ffe2',

  success: '#2fd463',
  warning: '#ffb300',
  danger: '#ff0000',

  bg: '#1b1e21',
  bgInverse: '#d8e2ed',
} as const;

export type ColorToken = keyof typeof colors;
