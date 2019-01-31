import React from 'react';
import { css } from '@emotion/core';

const styles = css({
  position: 'relative',
  '::after': {
    backgroundImage: `url(${require('./squiggles.svg')})`,
    backgroundPosition: '0 100%',
    // This has to be tuned to the typeface
    backgroundSize: '8.46px auto',
    backgroundRepeat: 'repeat-x',
    backgroundPositionX: '52%',
    content: '""',
    position: 'absolute',
    bottom: -4,
    left: 0,
    // Extra half a px seems to bridge the gap between separate spans
    // both decorated with squigglies when the background image doesn’t
    // go edge to edge for some reason
    width: 'calc(100% + 0.5px)',
    height: 4,
  },
});

export function TypeScriptDiagnosticToken(props: React.HTMLAttributes<HTMLElement>) {
 return <span {...props} css={styles} />;
}
