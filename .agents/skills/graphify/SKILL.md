# Skill: Graphify Project Knowledge

Use Graphify to create or refresh a navigable knowledge graph of the codebase when the tool is installed and its usage is verified.

## Procedure
1. Inspect the repository and identify the installed Graphify package/version and its authoritative README/help.
2. Confirm the exact CLI command, supported languages, include/exclude rules, and output directory options.
3. Exclude secrets, dependency directories, build output, caches, generated files, and irrelevant large assets.
4. Generate/update the graph using a verified command. Prefer output under `.agents/knowledge/graphify-out/` if Graphify supports a custom output path.
5. If the tool writes elsewhere, do not silently move or misrepresent its output; document the actual location and use a safe supported copy/configuration only if appropriate.
6. Summarize graph coverage, limitations, and useful architectural relationships in `GRAPH_REPORT.md` and update `PROJECT_KNOWLEDGE.md`.
7. Refresh after substantial architectural changes, not after every trivial edit.

Never invent Graphify flags, claim generation succeeded without checking the output, or include secrets in the graph.
