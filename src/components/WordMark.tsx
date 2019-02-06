import React from 'react';
import { Link } from 'gatsby';
import { css } from '@emotion/core';
import { resets, flex, type, textColor, darkMode } from '../styles/utils';
import { Icon } from './Icon';

const iconSize = 1;
const iconMargin = 0.5;
const containerStyles = css([
  resets.unanchor,
  flex.alignBaselines,
  {
    paddingBottom: `${iconMargin}em`,
    paddingRight: `${iconSize + iconMargin}em`,
    position: 'relative',
    flexShrink: 0,
    fontSize: '1rem', // Can be used to adjust scale of whole WordMark
  },
]);

const titleStyles = css([
  type.grotesk,
  textColor.secondary,
  darkMode({ opacity: 0.9 }),
  {
    whiteSpace: 'nowrap',
    margin: 0,
    textTransform: 'lowercase',
    color: 'var(--color-fg100)',
    opacity: 0.54,
    fontSize: '1.5096em',
  },
]);

const subtitleStyles = css([
  {
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 2,
    margin: 0,
    opacity: 0.64, // Gives approximately the same visual weight as 0.54 for the title
    fontSize: '0.75em',
  },
  darkMode({ opacity: 0.74 }),
]);

const logoStyles = css(darkMode({ filter: 'hue-rotate(-30deg)', opacity: 0.9 }));
const floatingStyles = css({
  position: 'absolute',
  right: 0,
  top: `${iconSize - iconMargin / 2}em`,
  overflow: 'visible',
});

export function WordMark() {
  return (
    <Link to="/" css={containerStyles}>
      <Icon
        src={require('./icons/logo.svg')}
        size={`${iconSize}em`}
        css={[logoStyles, { marginRight: `${iconMargin}em` }]}
      />
      <div>
        <h3 css={titleStyles}>Andrew Branch</h3>
        <h4 css={subtitleStyles}>Blogs About Things</h4>
      </div>
        <Icon
          src={require('./icons/logo2.svg')}
          size={`${iconSize * 2}em`}
          css={[logoStyles, floatingStyles]}
        />
    </Link>
  );
}
