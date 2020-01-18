import React from 'react';
import { Global, css } from '@emotion/core';
import Header from './Header';
import { rhythm } from '../utils/typography';
import { padding, Side, type, textColor, variables, minWidth, masked, margin, darkMode } from '../styles/utils';
import '../styles/variables.css';
import '../styles/fonts/fonts.css';
import { useOutlineStatus } from '../hooks/useOutlineStatus';
import { Footer } from './Footer';

const globalStyles = css({
  html: {
    height: '100%',
    minHeight: '100%',
    backgroundColor: 'var(--background)',
    WebkitFontSmoothing: 'antialiased',
  },
  'html[data-hide-outlines] :focus': {
    outline: 'none',
  },
  'body, #___gatsby, #___gatsby > *': {
    minHeight: '100%',
  },
  '.katex': {
    fontSize: '0.9rem',
  },
  'p > .katex, li > .katex': {
    padding: '0 2px',
  },
  '.katex-display': {
    margin: 0,
    // Get the potential scrollbar out of the way of the content
    ...padding(1, Side.Bottom),
    // Mask overflow
    overflow: 'auto',
    ...masked(rhythm(0.2), rhythm(0.5)),
    '.katex-html .base:last-child': padding(0.5, Side.Right),
  },
  pre: {
    lineHeight: 1.6,
  },
  ':not(pre) > code': [type.mono, {
    fontSize: '0.8rem',
    color: 'var(--inlineCodeText)',
    borderRadius: 3,
  }],
  a: {
    color: variables.colors.text.link,
    textDecorationSkip: 'ink',
    textDecorationSkipInk: 'auto',
    textDecoration: 'none',
    ':hover': { textDecoration: 'underline' },
    '> code': {
      background: 'transparent',
      padding: 0,
      color: 'inherit',
    },
  },
  '.footnotes p': {
    display: 'inline',
    fontSize: '0.9rem',
  },
  '.footnote-backref': {
    fontSize: 0,
    position: 'relative',
    '&::after': {
      content: '"↩\\fe0e"',
      fontSize: '1rem',
      position: 'absolute',
      left: 0,
    },
  },
  'ol, ul': minWidth(variables.sizes.bigEnough, {
    marginLeft: rhythm(2),
  }),
  h1: [type.display, type.features.addSwashes],
  'h2, h3, h4, h5, h6': {
    WebkitFontSmoothing: 'auto',
    ...type.features.addSwashes,
  },
  'h1 .anchor svg, h2 .anchor svg, h3 .anchor svg, h4 .anchor svg, h5 .anchor svg, h6 .anchor svg' : {
    fill: variables.colors.text.link,
  },
  '.post-body': {
    '.intro-caps': [type.variant.smallCaps, type.features.addDlig],
    h3: {
      fontVariant: 'small-caps',
      textTransform: 'lowercase',
      letterSpacing: '3px',
      fontWeight: 500,
      fontSize: '1rem',
      marginBottom: rhythm(0.25),
      ...type.features.addSwashes,
      code: {
        fontSize: '0.8em',
        fontVariant: 'normal',
        fontWeight: 'bold',
      },
    },
  },
  hr: {
    background: 'var(--color-fg20)',
  },
  img: [
    margin(-0.5, Side.Horizontal),
    { maxWidth: '100vw' },
    minWidth(variables.sizes.plusPhone, [margin(0, Side.Horizontal), { maxWidth: '100%' }]),
  ],
  figcaption: [
    type.grotesk,
    textColor.secondary,
    margin(0.4, Side.Top),
    { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
  ],
  '.asterism': [textColor.secondary, {
    fontFamily: 'AppleGothic, serif',
    fontSize: '1.5rem',
    textAlign: 'center',
  }],
  '.dark-only': {
    display: 'none !important',
    ...darkMode({ display: 'block !important' }),
  },
  '.light-only': darkMode({ display: 'none !important' }),
});

const Layout: React.FunctionComponent = ({ children }) => {
  useOutlineStatus();
  return (
    <>
      <Global styles={globalStyles} />
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          maxWidth: 760,
          padding: `0 ${rhythm(0.5)}`,
          margin: '0 auto',
        }}
      >
        <div>
          <Header />
          {children}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
