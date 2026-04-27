# Regression Checklist

Run before any release package is considered done.

## P0 Functional Checklist
- [ ] App launches
- [ ] New dialog creation works
- [ ] Send message works
- [ ] Regenerate works
- [ ] Assistant switch works
- [ ] Model switch works
- [ ] Provider switch works
- [ ] Custom provider works end-to-end
- [ ] OpenAI-compatible custom URL + key works
- [ ] Fetch model list works
- [ ] Tool calling works
- [ ] Reasoning content displays correctly
- [ ] Import database works
- [ ] Export database works
- [ ] Attachment upload works
- [ ] Image preview works
- [ ] iOS package installs
- [ ] Android package installs

## Release Gate
A build is not “done” until:
1. package built
2. package installed
3. P0 checklist reviewed
4. user-requested delivery channel honored
