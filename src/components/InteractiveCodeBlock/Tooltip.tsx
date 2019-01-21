import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useHover, HoverProps, UseHoverOptions } from '../../hooks';
import { ClassNames, ObjectInterpolation } from '@emotion/core';
import { gray } from '../../utils/typography';

export interface InjectedTriggerProps extends HoverProps, React.RefAttributes<HTMLElement> {

}

export interface InjectedTooltipProps extends HoverProps {
  className: string;
  style: React.CSSProperties;
}

export interface TooltipProps extends UseHoverOptions {
  renderTrigger: (props: InjectedTriggerProps, isHovering: boolean) => JSX.Element;
  renderTooltip: (props: InjectedTooltipProps) => JSX.Element;
  portalNode: HTMLElement;
  triggerMargin: number;
}

function createPositionStyle(triggerElement: HTMLElement | null, margin: number): React.CSSProperties {
  if (!triggerElement) {
    return {};
  }

  const rect = triggerElement.getBoundingClientRect();
  return {
    position: 'absolute',
    bottom: window.innerHeight - window.scrollY - rect.bottom + rect.height + margin,
    height: 'auto',
    left: rect.left,
  };
}

const overlayStyles: ObjectInterpolation<any> = {
  backgroundColor: 'white',
  zIndex: 1,
  padding: '2px 4px',
  borderRadius: 2,
  fontSize: '85%',
  boxShadow: `0 0 0 1px ${gray(0.1)}`,
};

export function Tooltip({
  renderTooltip,
  renderTrigger,
  portalNode,
  triggerMargin,
  ...useHoverOptions
}: TooltipProps) {
  const [isHovering, hoverProps] = useHover(useHoverOptions);
  const triggerRef = useRef<HTMLElement>(null);
  return (
    <React.Fragment>
      {renderTrigger({
        ...hoverProps,
        ref: triggerRef,
      }, isHovering)}
      {createPortal(
        isHovering ? (
          <ClassNames>
            {({ css }) => renderTooltip({
              ...hoverProps,
              style: createPositionStyle(triggerRef.current, triggerMargin),
              className: css(overlayStyles),
            })}
          </ClassNames>
        ) : null,
        portalNode,
      )}
    </React.Fragment>
  );
}

Tooltip.defaultProps = { portalNode: document.body, triggerMargin: 2 };
