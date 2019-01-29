import React from 'react';
import { StaticQuery, graphql } from 'gatsby';
import { Global } from '@emotion/core';
import Header from './Header';
import { rhythm, gray } from '../utils/typography';
import { padding, Side, type, textColor, variables } from '../styles/utils';
import '../styles/fonts/fonts.css';

const Layout: React.FunctionComponent = ({ children }) => (
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
          },
          'body, body > *, body > * > *': {
            height: '100%',
          },
          '.katex': {
            fontSize: '0.9rem',
          },
          a: {
            color: variables.colors.blue,
            '> code': {
              background: 'transparent',
              padding: 0,
            },
          },
          code: [type.mono, {
            fontSize: '0.8rem',
            background: gray(0.05),
            padding: '0 3px',
            borderRadius: 3,
          }],
          '.footnote-backref': {
            display: 'none',
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

export default Layout;
