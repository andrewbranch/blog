import { FixedObject, FluidObject } from 'gatsby-image';

declare module 'gatsby-image' {
  export interface ImageData {
    file: {
      childImageSharp: {
        fixed?: FixedObject;
        fluid?: FluidObject;
      }
    }
  }
}