import { applyPolyfills, defineCustomElements, JSX as LocalJSX } from '@seanwong24/s-magic-text/loader'
import { DetailedHTMLProps, HTMLAttributes } from 'react';

type StencilProps<T> = {
    [P in keyof T]?: Omit<T[P], 'ref'> | HTMLAttributes<T>;
};

type ReactProps<T> = {
    [P in keyof T]?: DetailedHTMLProps<HTMLAttributes<T[P]>, T[P]>;
};

type StencilToReact<T = LocalJSX.IntrinsicElements, U = HTMLElementTagNameMap> = StencilProps<T> &
    ReactProps<U>;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace JSX {
        interface IntrinsicElements extends StencilToReact { }
    }
}

applyPolyfills().then(() => {
    defineCustomElements(window);
});