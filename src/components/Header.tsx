import React from 'react';
import { flex, padding, Side, resets, type, textColor, margin, darkMode } from '../styles/utils';
import { Spacer } from './Spacer';
import { Icon } from './Icon';
import { Link } from 'gatsby';
import { Logo } from './Logo';
import { DarkModeSwitch } from './DarkModeSwitch';

export interface HeaderProps {
  siteTitle: string;
}

const Header: React.FunctionComponent<HeaderProps> = ({ siteTitle }) => (
  <div css={[flex.stretch, flex.verticallyCenter, padding(1, Side.Top), padding(2, Side.Bottom)]}>
    <Link to="/" css={[resets.unanchor, flex.alignBaselines]}>
      <Logo />
      <h3
        css={[
          type.grotesk,
          textColor.secondary,
          { margin: 0, textTransform: 'lowercase', color: 'var(--color-fg100)', opacity: 0.54 },
          margin(0.5, Side.Left),
        ]}
      >
        {siteTitle}
      </h3>
    </Link>
    <Spacer space={0.5}>
      <DarkModeSwitch css={{ padding: '0px 4px'}} />
      <a href="https://github.com/andrewbranch">
        <Icon src={require('../images/github-icon.svg')} css={darkMode({ filter: 'invert(100%)' })} />
      </a>
      <a href="https://twitter.com/atcb">
        <Icon src={require('../images/twitter-icon.svg')} size={26} />
      </a>
    </Spacer>
  </div>
);

export default Header;
