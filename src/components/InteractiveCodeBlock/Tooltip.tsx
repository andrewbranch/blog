import React, { useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useHover, HoverProps, UseHoverOptions } from '../../hooks';
import { ClassNames, css } from '@emotion/core';
import { isSSR } from '../../utils/ssr';

let idCounter = 0;
function uniqueTooltipId() {
  return `tooltip-${idCounter++}`;
}

export interface InjectedTriggerProps extends HoverProps, React.RefAttributes<HTMLElement> {
  'aria-describedby'?: string;
}

export interface InjectedTooltipProps extends React.RefAttributes<HTMLDivElement> {
  className?: string;
  style?: React.CSSProperties;
}

export interface TooltipProps extends UseHoverOptions {
  renderTrigger: (props: InjectedTriggerProps, isHovering: boolean) => JSX.Element;
  renderTooltip: (props: InjectedTooltipProps) => JSX.Element;
  portalNode: HTMLElement;
  triggerMargin: number;
  priority: number;
}

function createPositionStyle(
  triggerElement: HTMLElement | null,
  tooltipRect: ClientRect | null,
  margin: number,
): React.CSSProperties {
  const maxWidth = Math.min(700, document.documentElement.clientWidth - margin * 2);
  if (!triggerElement || !tooltipRect) {
    return { maxWidth };
  }

  const triggerRect = triggerElement.getBoundingClientRect();
  const rightOverflow = Math.max(0, triggerRect.left + tooltipRect.width - document.documentElement.clientWidth);
  const left = Math.max(window.scrollX, triggerRect.left - rightOverflow);
  return {
    maxWidth,
    position: 'absolute',
    bottom: document.documentElement.clientHeight - window.scrollY - triggerRect.bottom + triggerRect.height + margin,
    height: 'auto',
    left,
  };
}

const overlayStyles = css({
  backgroundColor: 'var(--background-alt)',
  zIndex: 1,
  borderRadius: 2,
  fontSize: '85%',
  boxShadow: '0 0 0 1px var(--color-fg10)',
});

const tooltipSectionStyles = css({
  display: 'block',
  padding: '2px 4px',
  ':not(:last-child)': {
    borderBottom: '1px solid var(--color-fg10)',
  },
});

interface TooltipContext {
  isInTooltip: boolean;
  priority: number;
  renderInParent: (
    node: React.ReactNode,
    tooltipRef: React.RefObject<HTMLElement>,
    props: InjectedTooltipProps & HoverProps,
    portalNode: Element,
    id: string,
  ) => React.ReactPortal | null;
}
const TooltipContext = React.createContext<TooltipContext>({
  isInTooltip: false,
  priority: 0,
  renderInParent: (node, ref, props, portalNode, id) => createPortal(
    <div role="tooltip" id={id} ref={ref as any} css={overlayStyles} {...props}>{node}</div>,
    portalNode,
  ),
});

function Tooltip({
  renderTooltip,
  renderTrigger,
  portalNode,
  triggerMargin,
  priority,
  ...useHoverOptions
}: TooltipProps) {
  const [isHovering, hoverProps] = useHover(useHoverOptions);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLElement>(null);
  const { current: id } = useRef(uniqueTooltipId());
  const [tooltipRect, setTooltipRect] = useState<ClientRect | null>(null);
  const [childTooltip, setChildTooltip] = useState<React.ReactNode>(null);
  const [offset, setOffset] = useState(0);
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const newRect = tooltipRef.current.getBoundingClientRect();
      // Only using width for now, might improve things and look at height later
      if (!tooltipRect || newRect.width !== tooltipRect.width) {
        setTooltipRect(newRect);
      }
    }
  });
  return (
    <TooltipContext.Consumer>
      {({ renderInParent, priority: parentPriority }) => (
        <TooltipContext.Provider
          value={{
            priority,
            isInTooltip: true,
            renderInParent: (node, childRef) => {
              setTimeout(() => {
                if ((!childTooltip || !node) && node !== childTooltip) {
                  setChildTooltip(node);
                  setOffset(childRef.current ? childRef.current.clientHeight : 0);
                }
              });
              return null;
            },
          }}
        >
          {renderTrigger({
            ...hoverProps,
            ref: triggerRef,
            'aria-describedby': isHovering ? id : undefined,
          }, isHovering)}

          {isSSR || !isHovering ? null : renderInParent(
            <>
              {parentPriority < priority ? childTooltip : null}
              <ClassNames>
                {({ css: createClassName }) => renderTooltip({
                  className: createClassName(tooltipSectionStyles),
                })}
              </ClassNames>
              {parentPriority < priority ? null : childTooltip}
            </>,
            tooltipRef,
            {
              ...hoverProps,
              style: createPositionStyle(triggerRef.current, tooltipRect, triggerMargin + offset),
            },
            portalNode,
            id,
          )}
        </TooltipContext.Provider>
      )}
    </TooltipContext.Consumer>
  );
}

Tooltip.defaultProps = {
  priority: 0,
  portalNode: isSSR ? undefined : document.body,
  triggerMargin: 2,
};

const MemoizedTooltip = React.memo(Tooltip);
export { MemoizedTooltip as Tooltip };
