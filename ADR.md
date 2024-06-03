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
