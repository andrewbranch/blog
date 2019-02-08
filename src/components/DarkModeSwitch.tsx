import { CSSTransition } from 'react-transition-group';
import React, { useEffect, HTMLAttributes, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { isSSR } from '../utils/ssr';
import { resets } from '../styles/utils';
import { Icon } from './Icon';
import { ClassNames, css } from '@emotion/core';

const buttonStyles = css([
  resets.unbutton,
  {
    '@media (prfers-color-scheme: dark)': { display: 'none' },
    boxSizing: 'content-box',
    position: 'relative',
    width: 30,
    height: 30,
    textAlign: 'center',
  },
]);

const containerStyles = css({ display: 'flex', alignSelf: 'stretch' });
const iconStyles = css({ position: 'absolute', top: 0, left: 0 });
const transitionEnter = css({ opacity: 0, transform: 'translateY(30px)' });
const transitionEnterActive = { opacity: 1, transform: 'translateY(0)', transition: 'all 0.15s ease-out' };
const transitionExit = transitionEnterActive;
const transitionExitActive = css({ opacity: 0, transform: 'translateY(-30px)', transition: 'all 0.15s ease-out' });

export function DarkModeSwitch(props: HTMLAttributes<HTMLElement>) {
  const [prefersDark, setPrefersDark] = useLocalStorage('prefersDark');
  const prevPrefersDark = useRef(prefersDark);
  useEffect(() => {
    if (!isSSR) {
      if (prefersDark) {
        if (prevPrefersDark.current !== prefersDark) {
          ga('send', 'event', 'theme', 'change', 'dark');
        }
        document.documentElement.setAttribute('data-prefers-dark', 'true');
      } else {
        if (prevPrefersDark.current !== prefersDark) {
          ga('send', 'event', 'theme', 'change', 'light');
        }
        document.documentElement.removeAttribute('data-prefers-dark');
      }
      prevPrefersDark.current = prefersDark;
    }
  }, [prefersDark]);

  return (
    <div {...props} css={containerStyles}>
      <button
        css={buttonStyles}
        onClick={() => setPrefersDark(prefersDark ? null : '1')}
      >
        <ClassNames>
          {({ css: cn }) => (
            <>
              <CSSTransition
                in={!!prefersDark}
                timeout={200}
                unmountOnExit
                classNames={{
                  enter: cn(transitionEnter),
                  enterActive: cn(transitionEnterActive),
                  exit: cn(transitionExit),
                  exitActive: cn(transitionExitActive),
                }}
              >
                <Icon
                  src={require('./icons/moon.svg')}
                  css={[iconStyles, { paddingTop: 2, paddingLeft: 2 }]}
                  size={26}
                  alt="Switch to light theme"
                />
              </CSSTransition>
              <CSSTransition
                in={!prefersDark}
                timeout={200}
                unmountOnExit
                classNames={{
                  enter: cn(transitionEnter),
                  enterActive: cn(transitionEnterActive),
                  exit: cn(transitionExit),
                  exitActive: cn(transitionExitActive),
                }}
              >
                <Icon
                  src={require('./icons/sun.svg')}
                  css={iconStyles}
                  size={30}
                  alt="Switch to dark theme"
                />
              </CSSTransition>
            </>
          )}
        </ClassNames>
      </button>
    </div>
  );
}
