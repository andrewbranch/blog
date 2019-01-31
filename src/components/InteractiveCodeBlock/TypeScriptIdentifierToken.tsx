import React from 'react';
import shallowEqual from 'shallowequal';
import { Tooltip } from './Tooltip';
import { TypeScriptQuickInfo } from './TypeScriptQuickInfo';
import { gray } from '../../utils/typography';
import { css } from '@emotion/core';

const styles = css({
  borderRadius: 2,
});

const hoveringStyles = css({
  borderRadius: 2,
  backgroundColor: gray(0.05),
  boxShadow: `0 0 0 2px ${gray(0.05)}`,
});

interface TypeScriptIdentifierTokenProps extends React.HTMLAttributes<HTMLSpanElement> {
  languageService: import('typescript').LanguageService;
  sourceFileName: string;
  position: number;
}
export const TypeScriptIdentifierToken = React.memo(({
  sourceFileName,
  position,
  languageService,
  ...props
}: TypeScriptIdentifierTokenProps) => {
  return (
    <Tooltip
      mouseEnterDelayMS={500}
      mouseOutDelayMS={50}
      renderTrigger={(triggerProps, isHovering) => (
        <span
          {...props}
          {...triggerProps}
          css={[styles, isHovering ? hoveringStyles : undefined]}
        />
      )}
      renderTooltip={tooltipProps => (
        <TypeScriptQuickInfo
          info={languageService.getQuickInfoAtPosition(sourceFileName, position)}
          {...tooltipProps}
        />
      )}
    />
  );
// Ignore `position` in memoization because it’s only used on hover callback
},
({ position: prevPosition, ...prevProps }, { position: nextPosition, ...nextProps }) => {
  return shallowEqual(prevProps, nextProps);
});
