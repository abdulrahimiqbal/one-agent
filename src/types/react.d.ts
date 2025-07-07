/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace React {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // allows for custom attributes
    [key: string]: any;
  }
}

declare module 'react' {
  export = React;
  export as namespace React;
} 