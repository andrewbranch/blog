import React from 'react';
import { css } from '@emotion/core';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import { flex, padding, Side, darkMode, minWidth, variables } from '../styles/utils';
import { Spacer } from './Spacer';
import { Icon } from './Icon';
import { WordMark } from './WordMark';
import { DarkModeSwitch } from './DarkModeSwitch';

const hiddenWhileTiny = css([
  { display: 'none' },
  minWidth(variables.sizes.plusPhone, { display: 'flex' }),
]);

function Header() {
  return (
    <div css={[flex.stretch, { alignItems: 'flex-start' }, padding(1, Side.Top), padding(2, Side.Bottom)]}>
      <WordMark />
      <Spacer space={0.5}>
        <DarkModeSwitch />
        <OutboundLink href="https://github.com/andrewbranch" css={hiddenWhileTiny}>
          <Icon src={require('../images/github-icon.svg')} css={darkMode({ filter: 'invert(100%)' })} />
        </OutboundLink>
        <OutboundLink href="https://twitter.com/atcb" css={hiddenWhileTiny}>
          <Icon src={require('../images/twitter-icon.svg')} size={26} />
        </OutboundLink>
      </Spacer>
    </div>
  );
}

export default Header;
