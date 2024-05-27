# routes

There's a problem catching all paths because it will also catch \_next and things in public.

In `next.config.mjs` I've therefore added a rewrites and redirects section as suggested by GPT4o: https://chatgpt.com/share/8d64a1fd-c314-4233-b7f3-28e8d93546ab

This will always take `_next` stuff from the asset, but won't do the same for any paths, as we now can put this in a subfolder called `handler`

This is a bit ugly but it's important because we need to be able to catch all, including paths starting with `_`
