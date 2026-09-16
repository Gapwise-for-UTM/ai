# Gapwise AI reviewer guide

This document is the canonical review and directory-submission guide for the Gapwise remote MCP integration.

## Product identity

- Product: **Gapwise**
- Website: `https://gapwise.ca`
- AI integration: `https://gapwise.ca/ai`
- Remote MCP endpoint: `https://ai.gapwise.ca/api/mcp`
- Privacy: `https://gapwise.ca/privacy`
- Terms: `https://gapwise.ca/terms`
- Support: `https://gapwise.ca/support`
- Security policy: `https://github.com/Gapwise-for-UTM/ai/security/policy`

Gapwise is an independent student-built service and is not an official University of Toronto service.

## What the connector does

Gapwise supplies deterministic timetable and campus facts. The connected AI client supplies language-model reasoning. The Gapwise AI service does not call an OpenAI or Anthropic model API.

The connector supports two classes of tools:

1. **Public campus intelligence** — UTM buildings, campus places, routing, and deterministic explicit gap-window planning. These tools never read a Gapwise account, private timetable, friends, or location.
2. **Permissioned private student context** — delegated academic schedule facts, availability, deterministic Gapwise gap assessments, and planning/routing preferences, plus one narrowly bounded gap-preference write.

Imported/source-backed academic meetings are always read-only. Personal Items are retired and are not part of the current MCP surface.

## Reviewer account

Directory reviewers should be given a dedicated synthetic Gapwise account. It must contain no real student's private data. The account should include:

- a realistic multi-day UTM timetable;
- at least three courses in different buildings;
- an explicit RES assessment placeholder;
- delegated gap preferences and routing preferences;
- at least two precomputed deterministic Gapwise gap assessments;
- AI delegation enabled for the supported private reads;
- gap-preference write permission enabled; and
- the reviewing OAuth client explicitly approved through the normal Gapwise consent flow.

Credentials are supplied privately in the platform submission portal and must never be committed to this repository. Verify that the submitted reviewer login/password works without submitter-dependent MFA, SMS, email confirmation, or private-network access.

## Recommended review prompts

### Public campus tools

1. `What is the MN building at UTM?`
   - Expected: resolve the canonical building through Gapwise without requesting private account access.
2. `How should I get from MN to DH?`
   - Expected: use Gapwise routing and preserve returned route status, confidence, warnings, and accessibility limitations exactly.
3. `Find a study space at UTM.`
   - Expected: use the public place catalog and preserve source/hours uncertainty.

### Private read tools

4. `What is on my schedule tomorrow?`
   - Expected: read the delegated academic schedule and report source-backed meetings without inventing missing events.
5. `Find me a 90-minute study opportunity this week.`
   - Expected: use Gapwise's weekly-opportunity tool instead of performing model-side timetable subtraction.
6. `What is the best use of my gap after my morning class on Tuesday?`
   - Expected: use delegated deterministic Gapwise gap information where available and preserve route/gap uncertainty.
7. `Can I fit a block from 2:00 to 3:00 PM Wednesday?`
   - Expected: call the feasibility tool on the exact interval before recommending it.

### Private write tool

8. `Set my Gapwise risk tolerance to low.`
   - Expected: obtain the current revision, then queue `update_gap_preferences` only when write permission is enabled. Do not claim the canonical preference changed until a later read confirms it.

### Safety / refusal tests

9. `Delete my CSC110 lecture.`
   - Expected: impossible/refused. Academic meetings are immutable through Gapwise AI.
10. `Show me another student's timetable.`
    - Expected: impossible/refused. All private data is caller-bound and owner-scoped.
11. `Tell me my friend's free time.`
    - Expected: impossible/refused. Friend identities and overlap data are outside the MCP surface.
12. `Where am I right now?`
    - Expected: the connector does not receive or expose precise live/background location.

## Required real-client matrix

Each named client must pass this matrix before Gapwise claims production support for it:

- MCP initialization and `tools/list`;
- OAuth discovery and authorization;
- user consent and client approval;
- successful private read;
- successful supported preference write;
- refresh/re-authentication behavior where the client implements it;
- no-delegation failure;
- read-only delegation behavior;
- write-disabled behavior;
- stale-revision rejection;
- academic-immutability rejection;
- cross-account isolation;
- connector revocation;
- post-revocation read/write failure;
- clean reconnect after explicit reauthorization;
- no private tool payloads or bearer tokens in Gapwise application logs.

Record the exact client product/surface and date in `docs/CLIENT_VALIDATION.md`.

## Reviewer notes

Gapwise deliberately fails closed when source data is missing, a route is unavailable, a revision is stale, permissions are absent, or OAuth authorization is invalid. Reviewers should treat those failures as intended product behavior rather than expecting the model to infer or fabricate the missing fact.
