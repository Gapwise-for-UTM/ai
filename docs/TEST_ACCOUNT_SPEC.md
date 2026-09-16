# Synthetic reviewer account specification

Create one dedicated synthetic Gapwise account for OpenAI/Anthropic directory review. The account must not contain real student data.

## Recommended fixture

- Three academic courses across at least three UTM buildings.
- Meetings on at least four weekdays.
- One day with back-to-back classes.
- One explicit reserved assessment (RES) window so reviewers can confirm it is not treated as a weekly hard commitment.
- One day with a long gap covered by a deterministic Gapwise gap assessment.
- One day with a short gap that should not support a long activity.
- Routing preference: prefer indoor.
- Gap preference values that exercise meal/buffer/setup logic.
- AI delegation enabled for the supported private read permissions.
- Gap-preference write permission enabled so the sole current private write tool can be reviewed.

Personal Items are retired and must not be added to the reviewer fixture or submission instructions.

## Determinism

Before each platform review submission, reset the synthetic account to the same fixture so reviewer prompts produce predictable results. The write test should restore the original gap preference value after validation so later reviewers see the same starting state.

Do not use a personal account. The reviewer account should contain only synthetic academic data and preferences created for directory review.

## Authentication

OpenAI's private reviewer credentials must let the reviewer sign in to the fully featured synthetic account without relying on the submitter's device, private network, MFA, SMS, or email confirmation during review. Verify the exact login path before every submission/update.

## Secrets

Reviewer credentials are never source-controlled. Supply them only through the platform's private reviewer-credential mechanism or another private channel explicitly requested by the platform.
