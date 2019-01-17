import * as React from 'react';
import { margin, Side } from '../styles/utils';

export interface SpacerProps extends React.HTMLAttributes<HTMLElement> {
  space: number;
  vertical?: boolean;
}

export const Spacer = React.memo<SpacerProps>(({ space, vertical, ...props }) => (
  <div
    {...props}
    css={{
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      alignItems: 'center',
      ...margin(-space / 2, vertical ? Side.Vertical : Side.Horizontal),
      '& > *': margin(space / 2, vertical ? Side.Vertical : Side.Horizontal),
    }}
  />
));

Spacer.displayName = 'Spacer';
