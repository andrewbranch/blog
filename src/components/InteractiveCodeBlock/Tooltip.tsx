import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useHover, HoverProps } from '../../hooks';

export interface InjectedTriggerProps extends HoverProps, React.RefAttributes<HTMLElement> {

}

export interface InjectedTooltipProps {
  style: React.CSSProperties;
}

export interface TooltipProps {
  renderTrigger: (props: InjectedTriggerProps) => JSX.Element;
  renderTooltip: (props: InjectedTooltipProps) => JSX.Element;
  portalNode: HTMLElement;
}

function createPositionStyle(triggerElement: HTMLElement | null): React.CSSProperties {
  if (!triggerElement) {
    return {};
  }

  const rect = triggerElement.getBoundingClientRect();
  return {
    position: 'absolute',
    top: rect.top + rect.height + window.scrollY,
    height: 'auto',
    left: rect.left,
  };
}

export function Tooltip({
  renderTooltip,
  renderTrigger,
  portalNode,
}: TooltipProps) {
  const [isHovering, hoverProps] = useHover();
  const triggerRef = useRef<HTMLElement>(null);
  return (
    <React.Fragment>
      {renderTrigger({
        ...hoverProps,
        ref: triggerRef,
      })}
      {createPortal(
        isHovering ? renderTooltip({ style: createPositionStyle(triggerRef.current) }) : null,
        portalNode,
      )}
    </React.Fragment>
  );
}

Tooltip.defaultProps = { portalNode: document.body };
