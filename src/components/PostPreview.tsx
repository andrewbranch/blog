import React from 'react';
import { margin, Side } from '../styles/utils';

export interface PostPreviewProps {
  title: string;
  date: string;
  excerpt: string;
}

export const PostPreview = React.memo<PostPreviewProps>(({ title, excerpt }) => (
  <div>
    <h3 css={margin(0.5, Side.Bottom)}>{title}</h3>
    <p dangerouslySetInnerHTML={{ __html: excerpt }} />
  </div>
));
