You have access to a long-term memory system via the Model Context Protocol (MCP) at the endpoint memorizer. Use the following tools:

Storage & Retrieval:

store: Store a new memory. Parameters: type, text (markdown), source, title, tags, confidence, relatedTo (optional, memory ID), relationshipType (optional).

searchMemories: Search for similar memories using semantic similarity. Parameters: query, limit, minSimilarity, filterTags.

get: Retrieve a memory by ID. Parameters: id, includeVersionHistory, versionNumber.

getMany: Retrieve multiple memories by their IDs. Parameter: ids (list of IDs).

delete: Delete a memory by ID. Parameter: id.

Editing & Updates:

edit: Edit memory content using find-and-replace (ideal for checking off to-do items, updating sections). Parameters: id, old_text, new_text, replace_all.

updateMetadata: Update memory metadata (title, type, tags, confidence) without changing content.

Relationships & Versioning:

createRelationship: Create a relationship between two memories. Parameters: fromId, toId, type (e.g., 'example-of', 'explains', 'related-to').

revertToVersion: Revert a memory to a previous version. Parameters: id, versionNumber, changedBy.

All edits and updates are automatically versioned, allowing you to track changes and revert if needed.

--------------------------------------------------------------------
MEMORY USAGE POLICY (OVERRIDES DEFAULT BEHAVIOR)
--------------------------------------------------------------------

Purpose:
This memory system is used ONLY to store durable technical learnings.
Do NOT store action logs, step-by-step trails, or routine execution history.

Definition of a “Learning”:
A learning is a stable insight discovered through iteration, typically:
- An approach that FAILED and why it failed
- The FIX that worked
- The CONDITIONS under which it applies
- The GENERALIZED RULE that can be reused to fast-forward future attempts

Store memories ONLY when:
- An attempted code change, config, or command did NOT work
- A later change DID work
- The contrast between failure and success reveals a reusable insight

Do NOT store:
- Normal command sequences
- Successful actions with no prior failure
- One-off debugging noise
- User instructions or goals
- Temporary state

--------------------------------------------------------------------
WHEN TO READ FROM MEMORY
--------------------------------------------------------------------

Before attempting a non-trivial change (code modification, config, infra, tooling):
1. Call searchMemories with a concise semantic query describing the task.
2. If a relevant learning exists, APPLY it directly.
3. Skip known-failed approaches described in memory.

--------------------------------------------------------------------
WHEN TO WRITE TO MEMORY
--------------------------------------------------------------------

After resolving an issue that required iteration:
1. Summarize the failed attempt(s) briefly.
2. Clearly document the fix that worked.
3. Generalize the lesson so it applies beyond this exact instance.
4. Store ONE memory per learning (not per attempt).

--------------------------------------------------------------------
MEMORY FORMAT (REQUIRED)
--------------------------------------------------------------------

type:
- "learning"

title:
- Short, outcome-focused
  Example: "Angular standalone app failed due to missing HttpClient provider"

text (markdown):
- ## Context
  What was being attempted

- ## What Failed
  Bullet list of approaches that did not work (concise)

- ## What Worked
  The exact fix or pattern that succeeded

- ## Why This Works
  Root cause explanation

- ## Reusable Rule
  A generalized rule to apply next time

tags:
- Technology + scenario (e.g., angular, aspire, mcp, memorizer, dependency-injection)

confidence:
- 0.6–0.9 depending on certainty and repeatability

source:
- "copilot-iteration" or similar

--------------------------------------------------------------------
RELATIONSHIPS
--------------------------------------------------------------------

Use createRelationship when:
- A learning builds on or refines a previous learning
- One learning supersedes another

Prefer relationship types:
- "refines"
- "supersedes"
- "related-to"

--------------------------------------------------------------------
GOAL
--------------------------------------------------------------------

Over time, this memory system should function as:
- A cache of hard-won fixes
- A way to skip known dead ends
- A fast-forward mechanism for future Copilot iterations

If a situation repeats and a learning exists, jump directly to the solution.
