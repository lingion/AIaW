# Architecture Boundaries

Purpose: prevent UI work from silently breaking runtime behavior.

## Layers

### 1. UI Layer
Files: `src/components/**`, `src/views/**`, `src/css/**`
Responsibility:
- visual presentation
- interaction layout
- conditional rendering
- view-only state

Must NOT change directly:
- provider resolution logic
- model resolution logic
- tool-calling orchestration
- import/export semantics
- database schema

### 2. State Layer
Files: `src/stores/**`, `src/composables/**` (view-state only)
Responsibility:
- persisted app preferences
- reactive state composition
- connecting UI to business layer

### 3. Business Layer
Files: `src/utils/values.ts`, `src/stores/providers.ts`, `src/composables/get-model.ts`, `src/views/DialogView.vue` send/stream path, import/export logic
Responsibility:
- provider definitions
- model/provider resolution
- tool-calling execution
- import/export behavior
- message send pipeline

### 4. Platform Layer
Files: `ios/**`, `android/**`, `src/utils/platform-api.ts`
Responsibility:
- package identity
- native bridges
- file export/import
- status/navigation bar integration

## Hard Rules
1. UI-only tasks should avoid Business Layer files unless a runtime bug is proven.
2. Any PR or session that changes both UI and Business Layer must state why.
3. Styling changes must never be used as a vehicle to smuggle logic changes.
4. Runtime bug fixes must identify which layer is broken before editing files.
