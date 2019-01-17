import Typography from 'typography';

const typography = new Typography({
  baseFontSize: '18px',
  baseLineHeight: 1.6,
  scaleRatio: 2.8,
  bodyWeight: 500,
  bodyFontFamily: ['Cormorant Garamond', 'Garamond', 'Georgia', 'serif'],
  headerFontFamily: ['Questrial', 'Helvetica Neue', 'Helvetica', '-apple-system', 'sans-serif'],
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
