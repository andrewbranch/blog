import { rhythm as createRhythm } from '../utils/typography';
import { ObjectInterpolation } from '@emotion/core';

export const stretch: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
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
