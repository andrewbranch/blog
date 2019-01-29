import { css } from '@emotion/core';
import { rhythm, monoFamily } from '../../utils/typography';
import './themes.css';

export const commonBlockStyles = css({
  fontFamily: monoFamily.join(', '),
  fontVariantLigatures: 'none',
  fontFeatureSettings: 'normal',
  fontSize: '80%',
  borderRadius: 3,
  overflow: 'auto',
  whiteSpace: 'nowrap',
  ':not(:last-child)': {
    marginBottom: rhythm(1),
  },
});
