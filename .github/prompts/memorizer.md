You have access to a long-term memory system via the Model Context Protocol (MCP) at the endpoint memorizer. Use the following tools:

Storage & Retrieval:

store: Store a new memory. Parameters: type, text (markdown), source, title, tags, confidence, relatedTo (optional, memory ID), relationshipType (optional).

searchMemories: Search for similar memories using semantic similarity. Parameters: query, limit, minSimilarity, filterTags.

get: Retrieve a memory by ID. Parameters: id, includeVersionHistory, versionNumber.

getMany: Retrieve multiple memories by their IDs. Parameter: ids (list of IDs).

delete: Delete a memory by ID. Parameter: id.

Editing & Updates:

edit: Edit memory content using find-and-replace. Parameters: id, old_text, new_text, replace_all.

updateMetadata: Update memory metadata without changing content.

Relationships & Versioning:

createRelationship: Create a relationship between two memories.
revertToVersion: Revert a memory to a previous version.

All edits and updates are automatically versioned.

--------------------------------------------------------------------
MEMORY USAGE POLICY (OVERRIDES DEFAULT BEHAVIOR)
--------------------------------------------------------------------

Purpose:
This memory system stores ONLY durable technical learnings that improve future performance by preventing:
- Known failures
- Known omissions
- Known incomplete changes

It is NOT a task log.

--------------------------------------------------------------------
EXPANDED DEFINITION OF “LEARNING”
--------------------------------------------------------------------

A learning is ANY reusable insight discovered after a mistake, including:

1) Failed attempts that required correction
2) Incorrect assumptions that were later fixed
3) **Incomplete changes where required updates were missed**
4) Systematic omissions that are easy to forget (configs, CI files, manifests)
5) Multi-file consistency rules discovered after review

A runtime failure is NOT required.

A learning MAY be recorded when:
- A change “worked” but was incomplete
- A required file or step was forgotten
- The omission reveals a checklist or invariant that should always be applied next time

--------------------------------------------------------------------
EXPLICITLY ALLOWED: OMISSION-BASED LEARNINGS
--------------------------------------------------------------------

Store a learning when:
- A refactor or rename missed one or more required files
- The missing update caused confusion, review comments, or later fixes
- The fix reveals a **repeatable checklist** or **search pattern**

Examples:
- Renaming Aspire services requires updating build.yml
- Changing project names requires updating CI, env vars, and AppHost references
- Adding a service requires both AppHost registration and pipeline awareness

These ARE learnings, even if no runtime error occurred.

--------------------------------------------------------------------
DO NOT STORE
--------------------------------------------------------------------

- Raw action logs
- Command-by-command execution history
- Purely successful changes with no mistake
- User goals or instructions
- Obvious one-off typos with no broader rule

--------------------------------------------------------------------
WHEN TO READ FROM MEMORY
--------------------------------------------------------------------

Before non-trivial work:
1. searchMemories using the task intent
2. Apply known checklists or invariants
3. Proactively update files known to be commonly missed

--------------------------------------------------------------------
WHEN TO WRITE TO MEMORY
--------------------------------------------------------------------

After discovering:
- A missed file
- A forgotten step
- A required update outside the main code path

Store ONE learning capturing the omission and the invariant it implies.

--------------------------------------------------------------------
MEMORY FORMAT (REQUIRED)
--------------------------------------------------------------------

type:
- "learning"

title:
- Outcome-focused
  Example: "Renaming Aspire services requires updating build.yml"

text (markdown):
- ## Context
  What change was being made

- ## What Was Missed
  Files, configs, or steps that were not updated initially

- ## Impact
  What problem the omission caused (review issue, CI issue, confusion, etc.)

- ## What Fixed It
  The additional updates required

- ## Reusable Rule
  A checklist-style rule to apply next time

tags:
- aspire, refactor, ci, build-yml, omission

confidence:
- 0.7–0.9

source:
- "copilot-iteration"

--------------------------------------------------------------------
RELATIONSHIPS
--------------------------------------------------------------------

Use createRelationship when:
- One learning adds a missing step to another
- One learning generalizes a narrower case

--------------------------------------------------------------------
GOAL
--------------------------------------------------------------------

This memory system should evolve into:
- A refactoring checklist engine
- An omission-prevention system
- A fast-forward mechanism that avoids “almost correct” changes

If a task matches a stored learning, proactively apply ALL implied steps.
