import { rhythm as createRhythm, groteskSansFamily, textColors, monoFamily } from '../utils/typography';
import { ObjectInterpolation } from '@emotion/core';

export const variables = {
  colors: {
    text: textColors,
    red: '#992E37',
    blue: '#2E8099',
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
};

const mono: ObjectInterpolation<any> = {
  fontFamily: monoFamily.join(', '),
  fontVariantLigatures: 'none',
  fontFeatureSettings: 'normal',
};

export const type = { grotesk, mono };

const unanchor: ObjectInterpolation<any> = {
  color: 'unset',
  textDecoration: 'none',
};

export const resets = {
  unanchor,
};

export const textColor = {
  primary: { color: variables.colors.text.primary },
  secondary: { color: variables.colors.text.secondary },
  disabled: { color: variables.colors.text.disabled },
};

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
    paddingTop: sides & Side.Top ? amount : undefined,
    paddingRight: sides & Side.Right ? amount : undefined,
    paddingBottom: sides & Side.Bottom ? amount : undefined,
    paddingLeft: sides & Side.Left ? amount : undefined,
  };
}

export function margin(rhythm: number, sides = Side.Vertical | Side.Horizontal): ObjectInterpolation<any> {
  const amount = createRhythm(rhythm);
  return {
    marginTop: sides & Side.Top ? amount : undefined,
    marginRight: sides & Side.Right ? amount : undefined,
    marginBottom: sides & Side.Bottom ? amount : undefined,
    marginLeft: sides & Side.Left ? amount : undefined,
  };
}
