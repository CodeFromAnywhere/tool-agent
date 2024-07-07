# routes

There's a problem catching all paths because it will also catch \_next and things in public.

In `next.config.mjs` I've therefore added a rewrites and redirects section as suggested by GPT4o: https://chatgpt.com/share/8d64a1fd-c314-4233-b7f3-28e8d93546ab

This will always take `_next` stuff from the asset, but won't do the same for any paths, as we now can put this in a subfolder called `handler`

This is a bit ugly but it's important because we need to be able to catch all, including paths starting with `_`

# Source of truth

First I've tried to make openai assistants api the source of truth, because it would be a good way to quickly onboard and have a nice UI to edit things. However, there are several disadvantages:

1. openai assistants doesn't store openapi path, auth, or other things related to how to execute the function tools.
2. openai assistants have propriatary tools such as code-interpreter and file-search
3. many people want to use something that is not OpenAI. we should support the entire ecosystem to a certain extent.

Therefore, the source of truth must now come from an **openapi** accompanied with instructions and some other config. This will only make one agent at once.

# Public Agents?

Not prio since this is 'trying to get public' rather than real utility. At some point I need it for self-play and testing but for this it doesn't seem like anything innovative.

# Providers

Nango has collected a [great list](https://raw.githubusercontent.com/NangoHQ/nango/master/packages/shared/providers.yaml) of providers with specifications of the auth type.

The JSON is [here](providers.json)

After a little parsing, I found that the majority of apps uses OAUTH2 with Nango.

```
OAUTH2: 157,
BASIC: 28,
API_KEY: 26,
APP_STORE: 1,
OAUTH2_CC: 8,
undefined: 24,
APP: 1,
CUSTOM: 1,
TBA: 1,
OAUTH1: 3,
NONE: 1,
```

I don't need to integrate with anything other than:

- BASIC
- API_KEY
- OAUTH2

Because that's already 211/218 that were defined at Nango.

After doing a bit more research to the others and the undefined ones, I found that there were a few notable ones that didn't use these methods according to Nango:

- google: calendar, docs, mail, sheet, drive, ads, youtube
- microsoft: teams, ads, power-bi, one-drive, one-note, outlook
- zoho
- apple app store

But after doing some research...

- https://developers.google.com/identity/protocols/oauth2
- https://learn.microsoft.com/en-us/advertising/guides/authentication-oauth?view=bingads-13
- https://learn.microsoft.com/en-us/onedrive/developer/rest-api/getting-started/authentication?view=odsp-graph-online
- https://www.zoho.com/books/api/v3/oauth/#overview

All these underspecified apis actually have oauth2! If I can rely on 3rd party providers correctly implementing the oauth2 spec, we should be good to integrate it directly, and use the openapis that they provide.

Of course, not all of them will have an openapi. That's actually the biggest issue. But this is solved with ai applied on a textual version of the docs.
