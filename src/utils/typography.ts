import Typography from 'typography';

const serifTypefaceName = 'Crimson Pro';
const sansTypefaceName = 'Questrial';

export const groteskSansFamily = [sansTypefaceName, 'Helvetica Neue', 'Helvetica', '-apple-system', 'sans-serif'];
export const serifFamily = [serifTypefaceName, 'Georgia', 'serif'];

export function gray(alpha: number) {
  return `rgba(0, 0, 0, ${alpha})`;
}

export const textColors = {
  primary: gray(0.9),
  secondary: gray(0.51),
  disabled: gray(0.32),
};

const typography = new Typography({
  bodyColor: textColors.primary,
  headerColor: textColors.primary,
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
