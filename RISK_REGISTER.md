# Risk Register

## Existing major risks
1. UI changes breaking runtime provider/model chain
2. Release packages shipped before full end-to-end verification
3. Delivery channel drift (Telegram requested, GitHub used)

## Additional probable loopholes

### RISK-004: Package identity drift
If experiment builds reuse the original bundle/package identifier, they can overwrite the user's stable app and corrupt testing. Every experimental branch/build must use a distinct package identity.

### RISK-005: Provider fallback masking real breakage
UI/menu/schema fallbacks can make a broken provider appear functional while runtime still fails. Any fallback added for visibility must be paired with runtime path validation.

### RISK-006: Build-chain patch drift
Temporary build fixes (sass patches, local dependency workarounds, local-only signing tweaks) can silently diverge from repository truth, producing packages that cannot be reproduced later. Every build workaround must be documented and either codified or removed.
