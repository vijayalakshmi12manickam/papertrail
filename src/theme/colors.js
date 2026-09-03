// PaperTrail's own identity: deep slate/navy for trust + a clear teal accent for
// positive/actionable states, red reserved strictly for overspend/debt so it stays meaningful.
export const light = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F4',
  border: '#E2E6EB',
  textPrimary: '#151B26',
  textSecondary: '#5B6472',
  textMuted: '#8A93A0',
  primary: '#1E3A5F',      // deep slate blue — headers, primary actions
  accent: '#0FA3A3',       // teal — positive amounts, active states, charts
  danger: '#D64545',       // overspend, "I owe" balances
  success: '#2E9E5B',      // "I'm owed", under-budget
  warning: '#E0A22C',      // near-budget-limit
  shared: '#6E5AC7',       // shared-expense highlight (distinct from red/green semantics)
  chartPalette: ['#0FA3A3', '#1E3A5F', '#6E5AC7', '#E0A22C', '#D64545', '#5B6472'],
};

export const dark = {
  background: '#0E1319',
  surface: '#161D26',
  surfaceAlt: '#1E2733',
  border: '#2A3441',
  textPrimary: '#EDF0F3',
  textSecondary: '#A7B0BC',
  textMuted: '#6E7885',
  primary: '#5B8DBE',
  accent: '#2EC4C4',
  danger: '#E8685F',
  success: '#4CBE7D',
  warning: '#EBB84F',
  shared: '#9884E8',
  chartPalette: ['#2EC4C4', '#5B8DBE', '#9884E8', '#EBB84F', '#E8685F', '#A7B0BC'],
};
