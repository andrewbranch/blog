import React from 'react';
import { Link } from 'gatsby';
import { css, ClassNames } from '@emotion/core';
import { flex, padding, Side, minWidth, variables, type, textColor, margin } from '../styles/utils';
import { Spacer } from './Spacer';
import { DarkModeSwitch } from './DarkModeSwitch';
import { rhythm } from '../utils/typography';

const styles = css([
  flex.verticallyCenter,
  padding(1, Side.Vertical),
  minWidth(variables.sizes.tablet, padding(2, Side.Bottom)),
]);

const navLinkStyles = css([
  type.grotesk,
  textColor.secondary,
  { textTransform: 'lowercase', fontWeight: 500 },
]);

function Nav(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <Spacer space={0.5} {...props}>
      <ClassNames>{({ css: cn }) => (
        <Link activeClassName={cn({ textDecoration: 'underline' })} css={navLinkStyles} to="/about">About</Link>
      )}</ClassNames>
    </Spacer>
  );
}

function Header() {
  return (
    <Spacer role="navigation" space={2} css={styles}>
      <a href="/" css={{ fontSize: 0 }}>
        <img src={require('../images/logo.svg')} css={margin(0)} alt="Andrew Branch" width={96} height={96} />
      </a>
      <div css={[flex.stretch, { flexGrow: 1, paddingTop: rhythm(1.5) }]}>
        <Nav />
        <DarkModeSwitch />
      </div>
    </Spacer>
  );
}

export default Header;
