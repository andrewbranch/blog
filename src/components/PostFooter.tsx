import React from 'react';
import { textColor } from '../styles/utils';

export interface PostFooterProps {
  date: string;
}

export function PostFooter({ date }: PostFooterProps) {
  return (
    <>
      <hr />
      <p css={[textColor.secondary, { margin: 0 }]}>
        <small>
          Published on {date}.<br />
          Questions? Comments? Corrections? Kudos? Find me on <a href="https://twitter.com/atcb">Twitter</a>.<br />
          Want to <a href="/">read something else</a>?
        </small>
      </p>
    </>
  );
}
