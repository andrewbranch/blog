import React from 'react';
import { margin, Side, resets, textColor } from '../styles/utils';
import { Link } from 'gatsby';

export interface PostPreviewProps {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export const PostPreview = React.memo<PostPreviewProps>(({ title, slug, date, excerpt }) => {
  return (
    <Link to={slug} css={resets.unanchor}>
      <div css={[textColor.secondary, { fontStyle: 'italic' }]}>{date}</div>
      <h3 css={margin(0.25, Side.Vertical)}>{title}</h3>
      <div css={{ '*': { margin: 0 } }} dangerouslySetInnerHTML={{ __html: excerpt }} />
    </Link>
  );
});
