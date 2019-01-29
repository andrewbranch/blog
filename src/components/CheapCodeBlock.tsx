import React from 'react';
import { css } from '@emotion/core';
import { commonBlockStyles } from './InteractiveCodeBlock/themes';

const styles = css([
  commonBlockStyles,
  {
    whiteSpace: 'pre',
    padding: 20,
  },
]);

export function CheapCodeBlock(props: React.HTMLAttributes<HTMLElement>) {
  return <pre css={styles} {...props} />;
}
