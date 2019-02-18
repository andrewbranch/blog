import React from 'react';
import { css } from '@emotion/core';
import { commonBlockStyles } from './InteractiveCodeBlock/themes';
import { rhythm } from '../utils/typography';
import { minWidth, variables, padding, Side } from '../styles/utils';

const styles = css([
  commonBlockStyles,
  {
    whiteSpace: 'pre',
    padding: `${rhythm(0.5)} ${rhythm(0)}`,
    ...minWidth(variables.sizes.bigEnough, padding(1, Side.Horizontal)),
    code: {
      fontSize: 'inherit',
      background: 'transparent',
      lineHeight: 'inherit',
    },
  },
]);

export function CheapCodeBlock(props: React.HTMLAttributes<HTMLElement>) {
  return <pre css={styles} {...props} />;
}
