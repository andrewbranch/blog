import React from 'react';
import { css } from '@emotion/core';
import { Tooltip } from './Tooltip';

const styles = css({
  position: 'relative',
  '::after': {
    backgroundImage: `url(${require('./squiggles.svg')})`,
    backgroundPosition: '0 100%',
    // This has to be tuned to the typeface
    backgroundSize: '8.46px 8px',
    backgroundRepeat: 'repeat-x',
    backgroundPositionX: '2.4px',
    content: '""',
    position: 'absolute',
    bottom: -7,
    left: 0,
    // Extra half a px seems to bridge the gap between separate spans
    // both decorated with squigglies when the background image doesn’t
    // go edge to edge for some reason
    width: 'calc(100% + 0.5px)',
    height: 8,
  },
});

export function TypeScriptDiagnosticToken(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <Tooltip
      mouseEnterDelayMS={500}
      mouseOutDelayMS={50}
      renderTrigger={triggerProps => <span {...triggerProps} {...props} css={styles} />}
      renderTooltip={tooltipProps => <span {...tooltipProps}>Bad error :(</span>}
    />
  );
}
