import React from 'react';
import ts from 'typescript';
import shallowEqual from 'shallowequal';
import { Tooltip } from './Tooltip';
import { TypeScriptQuickInfo } from './TypeScriptQuickInfo';
import { gray } from '../../utils/typography';

interface TypeScriptIdentifierTokenProps extends React.HTMLAttributes<HTMLSpanElement> {
  languageService: ts.LanguageService;
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
          css={{
            borderRadius: 2,
            backgroundColor: isHovering ? gray(0.05) : undefined,
            boxShadow: isHovering ? `0 0 0 2px ${gray(0.05)}` : undefined,
          }}
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
