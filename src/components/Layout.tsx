import React from 'react';
import { StaticQuery, graphql } from 'gatsby';

import Header from './Header';
import { rhythm } from '../utils/typography';
import { Global } from '@emotion/core';
import { padding, Side, grotesk, textColor } from '../styles/utils';

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
        <footer css={[padding(0.5, Side.Vertical), grotesk, textColor.secondary]}>
          <small>© {new Date().getFullYear()}. All rights reserved.</small>
        </footer>
      </div>
    </>)}
  />
);

export default Layout;
