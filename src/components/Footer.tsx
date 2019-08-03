import React from 'react';
import { css } from '@emotion/core';
import { margin, Side, padding, type, textColor, darkMode } from '../styles/utils';
import { Spacer } from './Spacer';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import { Icon } from './Icon';

const styles = css([
  margin(1, Side.Top),
  padding(1, Side.Bottom),
  type.grotesk,
  textColor.secondary,
  { textAlign: 'center', fontWeight: 500 },
]);

const iconStyles = css(darkMode({ filter: 'invert(100%)' }));

export function Footer() {
  return (
    <footer css={styles}>
      <hr />
      <Spacer space={0.5} css={{ display: 'flex', justifyContent: 'center' }}>
        <OutboundLink href="https://github.com/andrewbranch/blog">
          <Icon alt="GitHub profile" src={require('./icons/github-icon.svg')} css={iconStyles} />
        </OutboundLink>
        <OutboundLink href="https://twitter.com/atcb">
          <Icon alt="Twitter profile" src={require('./icons/twitter-icon.svg')} size={26} />
        </OutboundLink>
        <OutboundLink href="/rss.xml">
          <Icon alt="Subscribe" src={require('./icons/feed.svg')} css={iconStyles} size={26} />
        </OutboundLink>
      </Spacer>
      <small>
        ©&nbsp;{new Date().getFullYear()}&nbsp;Andrew&nbsp;Branch.
              Licensed&nbsp;under&nbsp;<a href="http://creativecommons.org/licenses/by/4.0/legalcode">CC‑BY‑4.0.</a>
      </small>
    </footer>
  );
}
