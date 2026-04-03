# Form System Exception Log

Purpose: track approved deviations from the form system rollout so legacy behavior is visible, reviewable, and time-bounded.

Use this log for any exception that keeps a legacy pattern alive past the intended rollout gate. Each entry should be specific enough to audit without extra context.

## Required Fields

- Exception ID
- Requested by
- Reason category
- Approved by
- One-off vs candidate pattern
- Status
- Review date
- Sunset date
- Notes

## Entry Template

| Exception ID | Requested by | Reason category | Approved by | One-off vs candidate pattern | Status | Review date | Sunset date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EX-000 |  |  |  |  | Proposed |  |  |  |

## Field Guidance

- Exception ID: stable identifier used in rollout notes, PRs, and reviews.
- Requested by: person or team that asked for the exception.
- Reason category: short label such as compatibility gap, migration blocker, customer risk, or operational dependency.
- Approved by: owner who accepted the exception and its risk.
- One-off vs candidate pattern: mark whether the issue is isolated or likely to repeat.
- Status: Proposed, Approved, Active, Expired, Closed, or Migrated.
- Review date: date when the exception must be re-evaluated.
- Sunset date: date when the exception should stop being valid unless renewed.
- Notes: short context, linked tickets, follow-up work, and any migration path.

## Approval Workflow

- Only the form system owner or a delegated domain owner can approve an exception.
- Release manager signoff is required before an Approved record becomes Active.
- Approval must record the reason category, review date, sunset date, and whether the item is a one-off or candidate pattern.
- The exception must be reviewed at least on the review date and again before the sunset date if it is still active.
- If the review date passes without renewal, the status becomes Expired and the exception must not be used for new work until it is re-approved.
- If the sunset date passes without closure or renewal, the status becomes Expired and the legacy pattern is treated as blocked for new forms until the backlog item is either migrated or explicitly renewed.
- Any renewal must link the previous Exception ID and record the new review/sunset dates.
