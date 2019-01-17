import React from 'react';
import { stretch, padding, Side } from '../styles/utils';
import { Spacer } from './Spacer';
import { Icon } from './Icon';

export interface HeaderProps {
  siteTitle: string;
}

const Header: React.FunctionComponent<HeaderProps> = ({ siteTitle }) => (
  <div css={{ ...stretch, ...padding(1, Side.Vertical) }}>
    <h3 css={{ margin: 0, textTransform: 'lowercase' }}>{siteTitle}</h3>
    <Spacer space={0.25}>
      <a href="https://github.com/andrewbranch">
        <Icon src={require('../images/github-icon.svg')} />
      </a>
      <a href="https://twitter.com/atcb">
        <Icon src={require('../images/twitter-icon.svg')} size={26} />
      </a>
    </Spacer>
  </div>
);

export default Header;
