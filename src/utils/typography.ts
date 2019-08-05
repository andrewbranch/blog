import Typography from 'typography';

const displayTypefaceName = 'Heldane Display';
const serifTypefaceName = 'Heldane';
const sansTypefaceName = 'Founders Grotesk';

export const groteskSansFamily = [sansTypefaceName, 'Helvetica Neue', 'Helvetica', '-apple-system', 'sans-serif'];
export const serifFamily = [serifTypefaceName, 'Georgia', 'serif'];
export const displayFamily = [displayTypefaceName, 'Georgia', 'serif'];
export const monoFamily = ['menlo', 'monaco', 'monospace'];

export const textColors = {
  highContrast: 'var(--highContrastText)',
  primary: 'var(--primaryText)',
  muted: 'var(--mutedText)',
  secondary: 'var(--secondaryText)',
  disabled: 'var(--disabledText)',
  link: 'var(--linkText)',
};

const typography = new Typography({
  bodyColor: textColors.primary,
  headerColor: textColors.highContrast,
  baseFontSize: '18px',
  baseLineHeight: 1.6,
  scaleRatio: 2.4,
  bodyWeight: 300,
  headerWeight: 300,
  bodyFontFamily: serifFamily,
  headerFontFamily: serifFamily,
});

export const rhythm = typography.rhythm;
export default typography;
