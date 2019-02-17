import React from 'react';
import { margin, Side, resets, textColor } from '../styles/utils';
import { Link } from 'gatsby';

export interface PostPreviewProps {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

const anchorTagPattern = /<\/?a[^>]*?>/ig;

// Forgive me my sins
function removeLinks(html: string) {
  return html.replace(anchorTagPattern, '');
}

const MemoizedPostPreview = React.memo<PostPreviewProps>(function PostPreview({ title, slug, date, excerpt }) {
  return (
    <Link to={slug} css={resets.unanchor}>
      <div css={[textColor.secondary, { fontStyle: 'italic' }]}>{date}</div>
      <h3 css={margin(0.25, Side.Vertical)}>{title}</h3>
      <div css={{ '*': { margin: 0 } }} dangerouslySetInnerHTML={{ __html: removeLinks(excerpt) }} />
    </Link>
  );
});

export { MemoizedPostPreview as PostPreview };
