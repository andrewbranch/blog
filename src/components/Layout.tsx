import React from 'react';
import { StaticQuery, graphql } from 'gatsby';
import { Global } from '@emotion/core';
import Header from './Header';
import { rhythm } from '../utils/typography';
import { padding, Side, type, textColor, variables } from '../styles/utils';
import '../styles/variables.css';
import '../styles/fonts/fonts.css';
import { useOutlineStatus } from '../hooks/useOutlineStatus';

const Layout: React.FunctionComponent = ({ children }) => {
  useOutlineStatus();
  return (
    <StaticQuery
      query={graphql`
        query SiteTitleQuery {
          site {
            siteMetadata {
              title
            }
          }
        }
      `}
      render={data => (<>
        <Global
          styles={{
            html: {
              height: '100%',
              minHeight: '100%',
              backgroundColor: 'var(--background)',
            },
            'html[data-hide-outlines] :focus': {
              outline: 'none',
            },
            'body, body > *, body > * > *': {
              height: '100%',
            },
            '.katex': {
              fontSize: '0.9rem',
            },
            a: {
              color: variables.colors.text.link,
              textDecorationSkip: 'ink',
              textDecorationSkipInk: 'auto',
              '> code': {
                background: 'transparent',
                padding: 0,
                color: 'inherit',
              },
            },
            pre: {
              lineHeight: 1.6,
            },
            code: [type.mono, {
              fontSize: '0.8rem',
              background: 'var(--color-fg05)',
              color: 'var(--highContrastText)',
              padding: '0 3px',
              borderRadius: 3,
            }],
            '.footnote-backref': {
              display: 'none',
            },
            'ol, ul': {
              marginLeft: rhythm(2),
            },
            hr: {
              background: 'var(--color-fg20)',
            },
          }}
        />
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            maxWidth: 720,
            padding: `0 ${rhythm(0.5)}`,
            margin: '0 auto',
          }}
        >
          <div>
            <Header siteTitle={data.site.siteMetadata.title} />
            {children}
          </div>
          <footer css={[padding(0.5, Side.Vertical), type.grotesk, textColor.secondary]}>
            <small>© {new Date().getFullYear()}. All rights reserved.</small>
          </footer>
        </div>
      </>)}
    />
  );
};

export default Layout;
