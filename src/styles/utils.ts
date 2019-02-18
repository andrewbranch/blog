import { rhythm as createRhythm, groteskSansFamily, textColors, monoFamily } from '../utils/typography';
import { ObjectInterpolation, Interpolation, keyframes } from '@emotion/core';

export const variables = {
  sizes: {
    plusPhone: 414,
    bigEnough: 550,
    tablet: 768,
  },
  colors: {
    text: textColors,
  },
};

const stretch: ObjectInterpolation<any> = {
  display: 'flex',
  justifyContent: 'space-between',
};

const verticallyCenter: ObjectInterpolation<any> = {
  display: 'flex',
  alignItems: 'center',
};

const alignBaselines: ObjectInterpolation<any> = {
  display: 'flex',
  alignItems: 'baseline',
};

export const flex = {
  stretch,
  verticallyCenter,
  alignBaselines,
};

const grotesk: ObjectInterpolation<any> = {
  fontFamily: groteskSansFamily.join(', '),
  fontWeight: 400,
  ...darkMode({ WebkitFontSmoothing: 'antialiased' }),
};

const mono: ObjectInterpolation<any> = {
  fontFamily: monoFamily.join(', '),
  fontVariantLigatures: 'none',
  fontFeatureSettings: 'normal',
  fontSize: '0.75rem',
};

export const type = { grotesk, mono };

export const textColor = {
  primary: { color: variables.colors.text.primary },
  secondary: { color: variables.colors.text.secondary },
  disabled: { color: variables.colors.text.disabled },
};

const unanchor: ObjectInterpolation<any> = {
  color: 'unset',
  textDecoration: 'none',
  ':hover': { textDecoration: 'none' },
};

const unbutton: ObjectInterpolation<any> = {
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  cursor: 'pointer',
  padding: '0',
  margin: '0',
  fontSize: 'inherit',
  fontWeight: 'unset',
  color: 'unset',
  textAlign: 'unset',
};

export const resets = {
  unanchor,
  unbutton,
};

const spinningKeyframes = keyframes({
  '0%': { transform: 'rotateZ(0deg)' },
  '100%': { transform: 'rotateZ(360deg)' },
});

const spinning: ObjectInterpolation<any> = {
  animation: `${spinningKeyframes} 1s linear infinite`,
};

export const animations = { spinning };

export enum Side {
  Top = 1 << 0,
  Right = 1 << 1,
  Bottom = 1 << 2,
  Left = 1 << 3,
  Vertical = Side.Top | Side.Bottom,
  Horizontal = Side.Left | Side.Right,
}

export function padding(rhythm: number, sides = Side.Vertical | Side.Horizontal): ObjectInterpolation<any> {
  const amount = createRhythm(rhythm);
  return {
    ...(sides & Side.Top ? { paddingTop: amount } : undefined),
    ...(sides & Side.Right ? { paddingRight: amount } : undefined),
    ...(sides & Side.Bottom ? { paddingBottom: amount } : undefined),
    ...(sides & Side.Left ? { paddingLeft: amount } : undefined),
  };
}

export function margin(rhythm: number, sides = Side.Vertical | Side.Horizontal): ObjectInterpolation<any> {
  const amount = createRhythm(rhythm);
  return {
    ...(sides & Side.Top ? { marginTop: amount } : undefined),
    ...(sides & Side.Right ? { marginRight: amount } : undefined),
    ...(sides & Side.Bottom ? { marginBottom: amount } : undefined),
    ...(sides & Side.Left ? { marginLeft: amount } : undefined),
  };
}

export function darkMode(styles: Interpolation<any>): ObjectInterpolation<any> {
  return {
    '@media (prefers-color-scheme: dark)': styles,
    'html[data-prefers-dark] &': styles,
  };
}

export function minWidth(width: number | string, styles: Interpolation<any>): ObjectInterpolation<any> {
  const widthString = typeof width === 'string' ? width : `${width}px`;
  return {
    [`@media (min-width: ${widthString})`]: styles,
  };
}

export function masked(maskStart: number | string, maskEnd: number | string): ObjectInterpolation<any> {
  const startString = typeof maskStart === 'string' ? maskStart : `${maskStart}px`;
  const endString = typeof maskEnd === 'string' ? maskEnd : `${maskEnd}px`;
  return {
    ...margin(-0.5, Side.Horizontal),
    ...padding(0.5, Side.Horizontal),
    maskImage: `linear-gradient(
      to right,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0) ${startString},
      rgba(0, 0, 0, 1) ${endString},
      rgba(0, 0, 0, 1) calc(100% - ${endString}),
      rgba(0, 0, 0, 0) calc(100% - ${startString})
    )`,
  };
}
