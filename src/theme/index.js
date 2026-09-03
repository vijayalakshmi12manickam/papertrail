import { light, dark } from './colors';
import { typography } from './typography';

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export function buildTheme(mode) {
  const colors = mode === 'dark' ? dark : light;
  return { mode, colors, typography, spacing, radius };
}
