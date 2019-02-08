import React from 'react';
import { Link } from 'gatsby';
import { css, ClassNames } from '@emotion/core';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import { flex, padding, Side, darkMode, minWidth, variables, type, textColor, margin } from '../styles/utils';
import { Spacer } from './Spacer';
import { Icon } from './Icon';
import { WordMark } from './WordMark';
import { DarkModeSwitch } from './DarkModeSwitch';

const hiddenWhileTiny = css([
  { display: 'none' },
  minWidth(variables.sizes.plusPhone, { display: 'flex' }),
]);

const hiddenAfterTiny = css([
  { display: 'flex' },
  minWidth(variables.sizes.plusPhone, { display: 'none' }),
]);

const hiddenUntilBigEnough = css([
  { display: 'none' },
  minWidth(variables.sizes.bigEnough, { display: 'flex' }),
]);

const hiddenAfterBigEnough = css([
  { display: 'flex' },
  minWidth(variables.sizes.bigEnough, { display: 'none' }),
]);

const navLinkStyles = css([
  type.grotesk,
  textColor.secondary,
  { textTransform: 'lowercase' },
]);

function Nav(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <Spacer space={0.5} {...props}>
      <ClassNames>{({ css: cn }) => (
        <Link activeClassName={cn({ textDecoration: 'underline' })} css={navLinkStyles} to="/about">About</Link>
      )}</ClassNames>
      <OutboundLink css={[navLinkStyles, hiddenAfterTiny]} href="https://github.com/andrewbranch">GitHub</OutboundLink>
      <OutboundLink css={[navLinkStyles, hiddenAfterTiny]} href="https://twitter.com/atcb">Twitter</OutboundLink>
    </Spacer>
  );
}

function Header() {
  return (
    <div css={[padding(1, Side.Vertical), minWidth(variables.sizes.tablet, padding(2, Side.Bottom))]}>
      <div css={[flex.stretch, { alignItems: 'flex-start' }]}>
        <Spacer role="navigation" space={2} css={flex.alignBaselines}>
          <WordMark />
          <Nav css={hiddenUntilBigEnough} />
        </Spacer>
        <Spacer space={0.5}>
          <DarkModeSwitch />
          <OutboundLink href="https://github.com/andrewbranch" css={hiddenWhileTiny}>
            <Icon
              alt="GitHub profile"
              src={require('./icons/github-icon.svg')}
              css={darkMode({ filter: 'invert(100%)' })}
            />
          </OutboundLink>
          <OutboundLink href="https://twitter.com/atcb" css={hiddenWhileTiny}>
            <Icon alt="Twitter profile" src={require('./icons/twitter-icon.svg')} size={26} />
          </OutboundLink>
        </Spacer>
      </div>
      <Nav css={[hiddenAfterBigEnough, margin(0.5, Side.Top)]} />
    </div>
  );
}

export default Header;
