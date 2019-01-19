import React from 'react';
import { variables } from '../styles/utils';

export interface LogoProps extends React.HTMLAttributes<HTMLElement> {
  size: number;
}

const golden = 1.61803398875;

export const Logo = ({ size }: LogoProps) => (
  <div css={{ width: size, height: size, position: 'relative', backgroundColor: 'white', display: 'inline-flex' }}>
    <div
      css={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 1 / golden * 100 + '%',
        height: '100%',
        backgroundColor: variables.colors.blue,
      }}
    />
    <div
      css={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 1 / golden * 100 + '%',
        backgroundColor: variables.colors.red,
      }}
    />
  </div>
);

Logo.displayName = 'Logo';
Logo.defaultProps = { size: 20 };
