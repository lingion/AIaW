# AIaW State Management & Dexie Audit Report

**Date**: 2026-06-26  
**Scope**: `/Users/lingion_k/.openclaw/workspace/projects/AIaW/src`  
**Focus**: State management reactivity, Dexie schema migrations, platform abstractions, DOM injection, streaming, error handling

---

## 1. 🔴 CRITICAL — Missing Dexie Version Migrations (Pitfall 1)

**File**: `src/utils/db.ts` (lines 47–60)

```ts
db.version(6).stores({ ... })
db.version(7).stores(schema)
```

**Problem**: The git history shows versions 1 through 5 existed across commits `37ffabe` → `deecec2` → `9bc2d8c` → `018315a`, but in the current code only `version(6)` and `version(7)` remain. Dexie **requires every intermediate version to be declared** — removing `db.version(1)` through `db.version(5)` means:

- **Users upgrading from any version < 6 will get a Dexie `SchemaError`** because the upgrade path is broken.
- Version 4 added `artifacts: 'id, workspaceId'` (replacing `canvases`). Version 5 added `providers: 'id'`. Version 6 added `imageCache: 'url'`. Users stuck on v3 or earlier have no migration path.
- The `Db` type alias (line 9–21) does match the current schema, so that part is correct.

**Suggested fix**: Restore all historical `db.version(N).stores(...)` calls. Use `git show <commit>:src/utils/db.ts` to reconstruct them:
```ts
db.version(1).stores({
  workspaces: 'id, name, parentId',
  dialogs: 'id, name, workspaceId',
  messages: 'id, dialogId, workspaceId, sender',
  assistants: 'id, name, workspaceId',
  canvases: 'id, name, workspaceId',
  installedPlugins: 'id',
  reactives: 'key',
  avatarImages: 'id'
})
// ... versions 2–5 as extracted from git history ...
db.version(6).stores({ ... })  // current
db.version(7).stores(schema)   // current
```

---

## 2. 🔴 HIGH — No Stream Cleanup on Navigation Away

**File**: `src/views/DialogView.vue` (line 497, 980–981, 1131)

```ts
import { computed, inject, onUnmounted, provide, ref, ... } from 'vue'  // line 497
// ...
const abortController = ref<AbortController>()  // line 980
// ...
abortController.value = new AbortController()  // line 1131
```

**Problem**: `onUnmounted` is **imported but never called** in the entire `<script setup>`. If the user navigates away from DialogView while a stream is active (or mid-plugin-call), the stream continues running in the background until the SDK decides to finish. This wastes tokens/API calls and can leave messages in `status: 'streaming'` permanently.

**Suggested fix**: Add an `onUnmounted` hook that aborts the controller:
```ts
onUnmounted(() => {
  abortController.value?.abort()
  abortController.value = undefined
})
```

Also note: the `@abort` handler on the send button (template line 483) calls `abortController?.abort()` but the catch block at line 1259 doesn't distinguish between user-abort and actual errors — aborted streams will still get marked as `'failed'` with an abort error message.

---

## 3. 🟡 MODERATE — Direct `fetch` Without Platform Abstraction (Pitfall 3)

**File**: `src/pages/ModelPricing.vue` (line 229)

```ts
const resp = await fetch(`${LitellmBaseURL}/model/info`, {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${apiKey.value}`
  }
})
```

**Problem**: This file uses bare `fetch` (the global `window.fetch`) without importing `{ fetch } from 'src/utils/platform-api'`. On Tauri desktop, `window.fetch` won't go through the Tauri stream transport, which means streaming responses (if any) won't work, and on Capacitor Android the native CORS bypass from `capacitor-stream-fetch` is also bypassed.

Currently this endpoint returns a JSON model list (not streaming), so the impact is limited to: Tauri users may hit CORS issues, and Capacitor Android users may get CORS blocks.

**Suggested fix**: Add `import { fetch } from 'src/utils/platform-api'` at the top of `ModelPricing.vue`.

---

## 4. 🟡 MODERATE — Empty Catch Blocks (Pitfall 8)

Six empty `catch {}` blocks found:

| File | Line | Context |
|------|------|---------|
| `src/views/AssistantView.vue` | 500 | `localStorage.setItem` backup |
| `src/components/TypesInput.vue` | 195 | `localStorage.setItem` secret history |
| `src/utils/file-ops-plugin.ts` | 158 | `Filesystem.mkdir` — "already exists" suppression |
| `src/utils/file-ops-plugin.ts` | 170 | `Filesystem.readFile` — "not found" suppression |
| `src/utils/file-ops-plugin.ts` | 246 | `Filesystem.stat` — "not found" suppression |
| `src/utils/image-cache.ts` | 120 | `db.imageCache.get` fallback |
| `src/stores/providers.ts` | 30 | Provider settings parsing |

**Assessment**: 
- The file-ops ones (lines 158, 170, 246) are **intentional** — they use catch to check existence before operating. This is an acceptable pattern for Capacitor's Filesystem API.
- `image-cache.ts` line 120 and `providers.ts` line 30 are **acceptable** — they're "try to read, fall back to null" patterns.
- `AssistantView.vue` line 500 and `TypesInput.vue` line 195 silently swallow localStorage errors (e.g., storage quota exceeded). These should at least `console.warn`.

**Suggested fix**: Add `console.warn` to the localStorage catches in AssistantView and TypesInput.

---

## 5. ✅ PASS — Non-Reactive `let` Flags in Templates (Pitfall 12)

**Files**: 
- `src/components/DialogList.vue` (lines 127–128)
- `src/components/WorkspaceListItem.vue` (lines 176–177)  
- `src/components/AssistantsExpansion.vue` (lines 129–130)

```ts
let longPressTimer: ReturnType<typeof setTimeout> | null = null
let longPressFired = false
```

**Assessment**: These `let` flags are **correctly non-reactive**. `longPressFired` is only read synchronously in `onItemClick(event)` which fires in the same event cycle as `onTouchEnd()`. The flag is never bound to a template via `:class`, `:to`, `:disabled`, or `:hidden` — it's only used in the imperative event handler. This is the correct pattern for transient event-cycle flags.

**Also checked**: `src/composables/useToast.ts` (lines 19–20) — `let toastStartY = 0` and `let toastCurrentY = 0` — same pattern, only used in touch event handlers, not in templates. ✅

---

## 6. ✅ PASS — Pending/Streaming Message Filtering (Pitfall 10)

**File**: `src/utils/dialog-message-map.js` (line 19)

```js
.filter(message => message && message.status !== 'inputing' && message.status !== 'pending' && message.status !== 'streaming')
```

**Assessment**: All three transient statuses are filtered. This prevents incomplete/partial messages from being sent to the LLM as context. The fix from commit `018315a` ("fix branch context leak") is correctly in place.

---

## 7. ✅ PASS — DOM Injection via onHtmlChanged + nextTick (Pitfall 4)

**File**: `src/components/MessageItem.vue` (lines 686–693)

```ts
function onHtmlChanged(inject = false) {
  nextTick(() => {
    inject && injectConvertArtifact()
    injectDisplayMathScroll()
    injectImageCacheForMessage()
    emit('rendered')
  })
}
```

**Assessment**: All four DOM manipulation functions (`injectConvertArtifact`, `injectDisplayMathScroll`, `injectImageCacheForMessage`, `handleImageClickCapture`) are properly guarded:
- The first three are called inside `onHtmlChanged` which wraps everything in `nextTick()`.
- `handleImageClickCapture` is a template event handler (`@click.capture`), not a post-render injection — it runs on actual user clicks so no timing issue.
- `ToolContent.vue` also properly wraps its `injectDisplayMathScroll` in `nextTick`.

---

## 8. 🟡 MODERATE — `getChain` Off-By-One Risk

**File**: `src/composables/use-dialog-chain.ts` (lines 20–34)

```ts
function getChain(node, route: number[]) {
  const tree = liveDialog.value?.msgTree || {}
  const children = tree[node]
  const r = route.at(0) || 0
  if (!Array.isArray(children) || children.length === 0) {
    return [[node], [r]]
  }
  const nextNode = children[r]
  if (nextNode) {
    const [restChain, restRoute] = getChain(nextNode, route.slice(1))
    return [[node, ...restChain], [r, ...restRoute]]
  } else {
    return [[node], [Math.min(Math.max(r, 0), children.length - 1)]]
  }
}
```

**Potential issue**: When `r` is out of bounds (i.e., `r >= children.length`), the fallback clamps to `children.length - 1`. This is defensive, but it means the returned `normalizedRoute` can differ from the stored `msgRoute`. The watch at line 55–64 handles this by writing the corrected route back, but if there's a timing gap between reading and writing, the UI briefly shows the wrong branch.

Also, `switchChain` at line 36–40 does:
```ts
const route = [...liveDialog.value.msgRoute.slice(0, index), value]
updateChain(route)
```
It passes a route that may not have entries for indices beyond `index`, but `updateChain` calls `getChain` which will fill them with `0` defaults. This is safe but implicit.

**Suggested fix**: Add a comment documenting the clamping behavior. No code change strictly required.

---

## 9. 🟡 MODERATE — Race in `send()` with Draft Editing

**File**: `src/views/DialogView.vue` (lines 956–964)

```ts
if (editingDraftState.value) {
  const { parentId, draftId } = editingDraftState.value
  const draftIndex = dialog.value.msgTree[parentId]?.indexOf(draftId)
  if (draftIndex == null || draftIndex < 0) {
    editingDraftState.value = null
    return
  }
  switchChain(chain.value.findIndex(id => id === parentId), draftIndex)
  await until(chain).changed()
  editingDraftState.value = null
}
const target = chain.value.at(-1)
await db.messages.update(target, { status: 'default' })
```

**Risk**: Between `editingDraftState.value = null` (line 965) and `chain.value.at(-1)` (line 968), if the chain computed property hasn't re-rendered yet, `target` might still point to the old tail message rather than the draft. The `until(chain).changed()` should prevent this, but if the chain doesn't actually change (e.g., draft was already at the end), `until().changed()` resolves immediately and the rest proceeds with the old chain.

**Suggested fix**: After clearing `editingDraftState`, re-derive `target` directly from the draft's position in the tree rather than relying on `chain.value.at(-1)`.

---

## 10. 🟢 INFO — URL.createObjectURL Leak Tracking

**Files**: 
- `src/composables/file-url.ts` (line 16)
- `src/utils/image-cache.ts` (lines 56, 82)

`URL.createObjectURL()` is called in both files but I did not find corresponding `URL.revokeObjectURL()` calls. The `file-url.ts` has a reference-counting pattern (`objectURLs[id].active`) suggesting cleanup is handled elsewhere. The `image-cache.ts` blob URLs persist for the page lifetime, which is acceptable for a chat app (images need to remain viewable). However, this means memory grows unbounded if the user has many long conversations with external images.

---

## Summary

| # | Severity | Issue | File |
|---|----------|-------|------|
| 1 | 🔴 CRITICAL | Dexie versions 1–5 removed — upgrade migration broken | `db.ts` |
| 2 | 🔴 HIGH | No stream abort on component unmount | `DialogView.vue` |
| 3 | 🟡 MODERATE | Bare `fetch` bypasses platform abstraction | `ModelPricing.vue` |
| 4 | 🟡 MODERATE | Silent empty catch blocks (2 of 7) | `AssistantView.vue`, `TypesInput.vue` |
| 5 | ✅ PASS | Non-reactive `let` flags — correctly implemented | 3 components |
| 6 | ✅ PASS | Pending/streaming filtering complete | `dialog-message-map.js` |
| 7 | ✅ PASS | DOM injection wrapped in nextTick | `MessageItem.vue` |
| 8 | 🟡 MODERATE | getChain clamping implicit | `use-dialog-chain.ts` |
| 9 | 🟡 MODERATE | send() draft→chain race edge case | `DialogView.vue` |
| 10 | 🟢 INFO | URL.createObjectURL without revoke | `file-url.ts`, `image-cache.ts` |
