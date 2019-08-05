import React from 'react';
import { type } from '../styles/utils';

export function SmallCaps(props: React.PropsWithChildren<{}>) {
  return <span {...props} css={[type.variant.smallCaps, type.features.addSwashes]} />;
}
