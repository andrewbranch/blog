import React from 'react';
import { css } from '@emotion/core';
import { Tooltip } from './Tooltip';
import { type } from '../../styles/utils';

const styles = css({
  backgroundColor: 'var(--diagnostic-bg)',
  boxShadow: '0 2px 0 0 var(--diagnostic-underline)',
});

export interface TypeScriptDiagnosticTokenProps extends React.HTMLAttributes<HTMLElement> {
  message: string;
}

const messageStyles = css([type.mono, {
  whiteSpace: 'pre-wrap',
}]);

export function TypeScriptDiagnosticToken({ message, ...props }: TypeScriptDiagnosticTokenProps) {
  return (
    <Tooltip
      mouseEnterDelayMS={200}
      mouseOutDelayMS={50}
      renderTrigger={triggerProps => <span {...triggerProps} {...props} css={styles} />}
      renderTooltip={tooltipProps => <span {...tooltipProps} css={messageStyles}>{message}</span>}
    />
  );
}
