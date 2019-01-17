import Typography from 'typography';

export const groteskSansFamily = ['Questrial', 'Helvetica Neue', 'Helvetica', '-apple-system', 'sans-serif'];
export const serifFamily = ['Cormorant Garamond', 'Garamond', 'Georgia', 'serif'];

export function gray(alpha: number) {
  return `rgba(0, 0, 0, ${alpha})`;
}

export const textColors = {
  primary: gray(0.9),
  secondary: gray(0.56),
  disabled: gray(0.42),
};

const typography = new Typography({
  bodyColor: textColors.primary,
  headerColor: textColors.primary,
  baseFontSize: '18px',
  baseLineHeight: 1.6,
  scaleRatio: 2.8,
  bodyWeight: 500,
  bodyFontFamily: serifFamily,
  headerFontFamily: groteskSansFamily,
  googleFonts: [{
    name: 'Questrial',
    styles: ['Regular'],
  }, {
    name: 'Cormorant Garamond',
    styles: ['Medium', 'Medium Italic', 'Bold'],
  }],
});

export const rhythm = typography.rhythm;
export default typography;
