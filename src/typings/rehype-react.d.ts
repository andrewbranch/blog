declare class RehypeReact {
  constructor(options: {
    createElement?: (
      type: keyof React.ReactHTML | React.ComponentType<any>,
      props: React.HTMLAttributes<HTMLElement>,
      children: React.ReactChildren,
    ) => React.ReactElement<any>,
    components?: { [K in keyof React.ReactHTML]?: React.ComponentType<any> },
  });
  public Compiler: (htmlAst: any) => React.ReactElement<any>;
}

declare module 'rehype-react' {
  export default RehypeReact;
}