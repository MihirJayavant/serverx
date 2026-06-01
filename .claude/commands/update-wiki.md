Update the wiki to document a newly added feature in libs.

Arguments: $ARGUMENTS Format: `<package> <feature-name>`

- `<package>`: either `server` or `utils`
- `<feature-name>`: kebab-case name matching the folder/file in libs (e.g.
  `rate-limiter`)

Example: `update-wiki utils rate-limiter`

---

## Step 1 — Read the new feature source

Find and read all source files for the feature under `libs/<package>/`:

- The main implementation file(s)
- Any exported types and public API surface
- `libs/<package>/mod.ts` to confirm what is exported publicly

Do not infer — read the real code to extract accurate types, function
signatures, and behaviour.

---

## Step 2 — Create `wiki/<PascalCase-Feature>.md`

Write a new wiki page following the exact style of existing pages (see
`wiki/Result-Types.md` as the reference):

````markdown
# <Feature Title>

One-paragraph overview of what the feature does and why you'd use it.

```ts
import { ... } from "@serverx/<package>";
```
````

---

## <Main Type or Class>

Show the TypeScript type or class signature.

---

## <Public Functions / Methods>

For each exported function or class method:

- One-line description
- TypeScript signature as a code block
- Minimal usage example showing the common case

---

## Related

- Links to related wiki pages using [[Page-Name]] syntax

```
Rules for the page:
- Derive all types, function signatures, and behaviour from the actual source files read in Step 1
- Match heading depth, code fence style, and `---` dividers of existing pages exactly
- Only document the public API (what is re-exported from `mod.ts`)
- Keep examples minimal — one real usage per function is enough

---

## Step 3 — Update `wiki/_Sidebar.md`

Add the new page under the correct package section:
- `**@serverx/server**` if package is `server`
- `**@serverx/utils**` if package is `utils`

Insert it in a logical position relative to existing entries (alphabetical or by relatedness).
```

- [[<PascalCase-Feature>]]

```
---

## Step 4 — Update `wiki/Home.md`

Add an entry under the matching `### @serverx/<package>` section:
```

- [[<PascalCase-Feature>]] — one-line description

```
Insert it in the same relative position as in `_Sidebar.md`.

---

## Rules

- Never modify any wiki page other than `_Sidebar.md` and `Home.md`, plus the new page you create.
- All content must be derived from the source files — do not invent behaviour.
- Match the formatting style of existing wiki pages exactly.
```
