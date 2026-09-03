import { Platform } from 'react-native';

// System fonts: no font-loading flash, and the platform-native numeral shapes
// (tabular figures) read best for currency amounts in dense lists.
const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const fontFamilyMono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export const typography = {
  fontFamily,
  fontFamilyMono, // used for amount columns so decimals align in lists
  h1: { fontFamily, fontSize: 28, fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontFamily, fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
  h3: { fontFamily, fontSize: 16, fontWeight: '600' },
  body: { fontFamily, fontSize: 15, fontWeight: '400' },
  bodyStrong: { fontFamily, fontSize: 15, fontWeight: '600' },
  caption: { fontFamily, fontSize: 12, fontWeight: '500' },
  amountLarge: { fontFamily: fontFamilyMono, fontSize: 32, fontWeight: '600' },
  amount: { fontFamily: fontFamilyMono, fontSize: 15, fontWeight: '600' },
};
