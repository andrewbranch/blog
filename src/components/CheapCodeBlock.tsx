import React from 'react';
import { css } from '@emotion/core';
import { commonBlockStyles } from './InteractiveCodeBlock/themes';
import { rhythm } from '../utils/typography';

const styles = css([
  commonBlockStyles,
  {
    whiteSpace: 'pre',
    padding: `${rhythm(0.5)} ${rhythm(1)}`,
  },
]);

export function CheapCodeBlock(props: React.HTMLAttributes<HTMLElement>) {
  return <pre css={styles} {...props} />;
}
