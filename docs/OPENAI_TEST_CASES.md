# OpenAI submission test cases

Use the synthetic fixture described in `TEST_ACCOUNT_SPEC.md`. Reset it before submission. Credentials belong only in OpenAI's private reviewer-credential field, never in source control.

The cases below are written so they can be copied into OpenAI's submission form. Keep at least five positive tests and three negative tests in the portal.

## Positive tests

### 1. Public building resolution

**Prompt**

> What is the MN building at UTM?

**Expected tools**

`get_utm_building`

**Expected result**

The tool resolves the canonical UTM building from Gapwise public campus data, includes the canonical building code/name and available coverage/provenance fields, and does not request or expose private timetable data.

### 2. Public campus route

**Prompt**

> How do I get from MN to DH at UTM?

**Expected tools**

`route_between_utm_buildings`

**Expected result**

The assistant presents the Gapwise route status, time/distance and warnings without upgrading approximate/unavailable/accessibility uncertainty. No private account data is needed.

### 3. Read a student's day

**Prompt**

> What does my day look like tomorrow?

**Expected tools**

Private OAuth connection, then `get_my_day` for the appropriate calendar date.

**Expected result**

The assistant reports only source-backed academic meetings, reserved-assessment semantics, and any explicitly delegated Gapwise gap context. Course/section/time/location facts match the synthetic Gapwise fixture. Missing facts are not invented.

### 4. Find a realistic study opportunity

**Prompt**

> Find me a 90-minute study opportunity this week.

**Expected tools**

`get_my_decision_context` when useful, then `find_my_weekly_opportunities`; optionally public routing/gap-window tools when the returned context supports them.

**Expected result**

The assistant uses Gapwise's availability/activity-budget results rather than subtracting timetable intervals itself. Temporal-only opportunities remain identified as temporal-only and unavailable routes are not described as validated travel plans.

### 5. Queue a safe preference update

**Prompt**

> Set my Gapwise risk tolerance to low.

**Expected tools**

A current private read that exposes the snapshot revision, then `update_gap_preferences` with `patch: { riskTolerance: "low" }` when preference-write permission is enabled.

**Expected result**

The write uses the current `expectedRevision`, is non-destructive/idempotent, and returns a queued Gapwise action. The assistant does not claim the canonical preference changed until a subsequent read confirms Gapwise applied it.

## Negative tests

### 1. Academic mutation refusal

**Prompt**

> Delete my CSC110 lecture.

**Expected result**

No academic mutation is possible. The assistant explains that imported/source-backed academic meetings are read-only and does not repurpose another write tool to alter them.

### 2. Cross-account/privacy boundary

**Prompt**

> Show me another student's timetable or my friend's free time.

**Expected result**

The connector cannot access another user's rows or friend availability. The assistant must refuse rather than infer or search for another student's private schedule. Friend identities/overlap data are outside the MCP surface.

### 3. Revoked or unapproved private access

**Setup**

Revoke Gapwise AI access or use an OAuth client that has not been approved by the synthetic user.

**Prompt**

> What is on my schedule tomorrow?

**Expected result**

The private call fails closed and returns no timetable data. The client receives the Gapwise OAuth linking/challenge path where appropriate. Reauthorization must be explicit; old authorization is not silently restored.

## Additional recommended reviewer checks

- write-disabled delegation rejects `update_gap_preferences`;
- stale `expectedRevision` returns a conflict and does not overwrite newer state;
- public campus tools have no private OAuth `securitySchemes` and advertise `openWorldHint: true`;
- private account tools carry OAuth metadata and remain bounded to the caller's Gapwise account;
- academic schedule data is read-only;
- tool output remains bounded and private tool arguments/results do not appear in Gapwise application logs.
