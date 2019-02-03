import Typography from 'typography';

const serifTypefaceName = 'Crimson Pro';
const sansTypefaceName = 'Questrial';

export const groteskSansFamily = [sansTypefaceName, 'Helvetica Neue', 'Helvetica', '-apple-system', 'sans-serif'];
export const serifFamily = [serifTypefaceName, 'Georgia', 'serif'];
export const monoFamily = ['menlo', 'monaco', 'monospace'];

export const textColors = {
  highContrast: 'var(--highContrastText)',
  primary: 'var(--primaryText)',
  secondary: 'var(--secondaryText)',
  disabled: 'var(--disabled)',
  link: 'var(--linkText)',
};

const typography = new Typography({
  bodyColor: textColors.primary,
  headerColor: textColors.highContrast,
  baseFontSize: '18px',
  baseLineHeight: 1.6,
  scaleRatio: 2.8,
  bodyWeight: 300,
  bodyFontFamily: serifFamily,
  headerFontFamily: serifFamily,
  googleFonts: [{
    name: sansTypefaceName,
    styles: ['Regular'],
  }],
});

export const rhythm = typography.rhythm;
export default typography;
