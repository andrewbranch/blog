import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHover, HoverProps, UseHoverOptions } from '../../hooks';
import { ClassNames, ObjectInterpolation } from '@emotion/core';
import { gray } from '../../utils/typography';
import { isSSR } from '../../utils/ssr';

export interface InjectedTriggerProps extends HoverProps, React.RefAttributes<HTMLElement> {

}

export interface InjectedTooltipProps extends HoverProps, React.RefAttributes<HTMLElement> {
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

interface TooltipContext {
  isInTooltip: boolean;
  renderInParent: (
    node: React.ReactNode,
    tooltipRef: React.RefObject<HTMLElement>,
    portalNode: Element,
  ) => React.ReactPortal | null;
}
const TooltipContext = React.createContext<TooltipContext>({
  isInTooltip: false,
  renderInParent: (node, _, portalNode) => createPortal(node, portalNode),
});

function Tooltip({
  renderTooltip,
  renderTrigger,
  portalNode,
  triggerMargin,
  ...useHoverOptions
}: TooltipProps) {
  const [isHovering, hoverProps] = useHover(useHoverOptions);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLElement>(null);
  const [childTooltip, setChildTooltip] = useState<React.ReactNode>(null);
  const [offset, setOffset] = useState(0)
  return (
    <TooltipContext.Consumer>
      {({ renderInParent }) => (
        <TooltipContext.Provider
          value={{
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
          }, isHovering)}
          {isSSR ? null : renderInParent(
            isHovering ? (
              <>
                <ClassNames>
                  {({ css }) => renderTooltip({
                    ...hoverProps,
                    ref: tooltipRef,
                    style: createPositionStyle(triggerRef.current, triggerMargin + offset),
                    className: css(overlayStyles),
                  })}
                </ClassNames>
                {childTooltip}
              </>
            ) : null,
            tooltipRef,
            portalNode,
          )}
        </TooltipContext.Provider>
      )}
    </TooltipContext.Consumer>
  );
}

Tooltip.defaultProps = {
  portalNode: isSSR ? undefined : document.body,
  triggerMargin: 2,
};

const MemoizedTooltip = React.memo(Tooltip);
export { MemoizedTooltip as Tooltip };
