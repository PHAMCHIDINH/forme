# Form System Deprecation Plan

Purpose: define how legacy form patterns are retired in controlled stages so rollout gates stay enforceable and exceptions do not become permanent defaults.

## Release Milestones

| Milestone | Owner roles | Target date | Completion criteria |
| --- | --- | --- | --- |
| Release R+1 | Form system owner, release manager | R+1 release train cutover | Legacy patterns are blocked for new forms; the release checklist requires exception-log review before merge; existing forms can use legacy paths only through an approved exception record. |
| Release R+2 | Form system owner, platform owner, release manager | R+2 release train cutover | Bridge/legacy compatibility layer is removed; all active forms resolve through the new form system path; any remaining legacy dependency is reclassified as an exception and reviewed in the same train. |
| Release R+3 | Form system owner, product owner, release manager | R+3 release train cutover | Exception backlog is reviewed end-to-end; each remaining entry is closed, migrated, or explicitly renewed with a fresh approval; the log shows no unowned or expired exceptions. |

## Operating Rules

- Every exception must have an owner, review date, and sunset date.
- New exceptions should be treated as temporary unless the plan explicitly classifies them as a candidate pattern.
- Rollout reviews should use this plan together with the exception log to decide whether a legacy path stays open, gets migrated, or is removed.
- A milestone is not complete until the release checklist includes the milestone outcome and links the approving record.
