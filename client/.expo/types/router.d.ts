/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/forgot-password`; params?: Router.UnknownInputParams; } | { pathname: `/gym`; params?: Router.UnknownInputParams; } | { pathname: `/home`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/kitchen`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/register`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/forgot-password`; params?: Router.UnknownOutputParams; } | { pathname: `/gym`; params?: Router.UnknownOutputParams; } | { pathname: `/home`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/kitchen`; params?: Router.UnknownOutputParams; } | { pathname: `/login`; params?: Router.UnknownOutputParams; } | { pathname: `/register`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/forgot-password${`?${string}` | `#${string}` | ''}` | `/gym${`?${string}` | `#${string}` | ''}` | `/home${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/kitchen${`?${string}` | `#${string}` | ''}` | `/login${`?${string}` | `#${string}` | ''}` | `/register${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/forgot-password`; params?: Router.UnknownInputParams; } | { pathname: `/gym`; params?: Router.UnknownInputParams; } | { pathname: `/home`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/kitchen`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/register`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
