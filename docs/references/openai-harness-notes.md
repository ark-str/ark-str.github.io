# OpenAI Harness Notes

These notes distill the official OpenAI posts that informed this repository shape.

## Source Principles

1. Start with an empty repo and let the scaffold be agent-friendly from day one.
2. Treat the engineer's job as harness design, not hand-coding.
3. Make the application and repository legible to the agent.
4. Use a short `AGENTS.md` as a table of contents, not a giant manual.
5. Encode architecture and taste as mechanical checks.
6. Make plans, docs, tests, and validation part of the agent's default loop.
7. Prefer continuous cleanup over periodic manual AI-slop reduction.

## How That Maps Here

- `AGENTS.md` is intentionally short and points to deeper docs.
- `docs/` is the repository-local system of record.
- `scripts/guards/` encode boundary and asset rules.
- `scripts/harness/run-iteration.mjs` wraps a full Codex iteration.
- the sample feature keeps bundled resources and persistence explicit.

## Official Sources

- OpenAI, "Harness engineering: leveraging Codex in an agent-first world"  
  https://openai.com/index/harness-engineering/
- OpenAI, "From model to agent: Equipping the Responses API with a computer environment"  
  https://openai.com/index/equip-responses-api-computer-environment/
