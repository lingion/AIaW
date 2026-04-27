# Active Runtime Config

Use this file for current debugging sessions involving providers/models/tools.

## Required fields per investigation
- provider type
- endpoint / baseURL
- model name
- key fingerprint (never plain secret unless user explicitly wants it stored in-repo)
- package/build under test
- expected behavior
- actual behavior

## Rule
Never debug provider/model issues from memory alone. Pin the active runtime tuple here first.
