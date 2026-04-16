"use client";

import { checklistItems, resourceManifest } from "@/features/harness/config/resource-manifest";
import { useHarnessWorkspace } from "@/features/harness/runtime/use-harness-workspace";
import styles from "@/features/harness/ui/harness-dashboard.module.css";

const kindLabel = {
  copy: "CP",
  token: "TK",
  media: "MD",
  qa: "QA",
} as const;

export function HarnessDashboard() {
  const {
    workspace,
    savedLabel,
    progress,
    setGoal,
    setNotes,
    toggleChecklist,
    toggleResource,
    seedDemo,
    reset,
  } = useHarnessWorkspace();

  return (
    <div className={styles.page} data-testid="harness-page">
      <main className={styles.shell} data-testid="harness-dashboard">
        <section className={styles.hero}>
          <article className={`${styles.panel} ${styles.heroMain}`}>
            <div className={styles.eyebrow}>Ark STR Harness</div>
            <h1 className={styles.title}>Agentic single-page environment.</h1>
            <p className={styles.lead}>
              This starter keeps the product intentionally small: one Next.js page, bundled
              resources only, and local-first persistence. The repository shape, checks, and
              iteration harness are designed so an agent can implement, verify, and report one
              coherent change without extra human glue work.
            </p>
            <div className={styles.metricRow}>
              <div className={styles.metric}>
                <div className={styles.metricLabel}>Persistence</div>
                <div className={styles.metricValue}>localStorage</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricLabel}>Resource Mode</div>
                <div className={styles.metricValue}>Bundled Only</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricLabel}>Verification</div>
                <div className={styles.metricValue}>
                  {progress.completed}/{progress.total} tracked
                </div>
              </div>
            </div>
            <div className={styles.hydration}>
              <span>Auto-saving locally</span>
              <span>•</span>
              <span>{savedLabel}</span>
            </div>
          </article>

          <aside className={styles.heroSide}>
            <section className={`${styles.panel} ${styles.card} ${styles.cardAccent}`}>
              <h2>What this harness encodes</h2>
              <p>
                Short `AGENTS.md`, repository-local specs, mechanical checks, and a non-interactive
                Codex entry point.
              </p>
            </section>
            <section className={`${styles.panel} ${styles.card} ${styles.cardSlate}`}>
              <h2>Why it matters</h2>
              <p>
                The agent does better when the repo contains the map, the rules, and the feedback
                loop instead of hidden tribal knowledge.
              </p>
            </section>
          </aside>
        </section>

        <section className={styles.grid}>
          <div className={styles.stack}>
            <section className={`${styles.panel} ${styles.card}`}>
              <div className={styles.sectionTitle}>
                <h2>Bundled Resource Manifest</h2>
                <span>{workspace.selectedResourceIds.length} selected for the current pass</span>
              </div>
              <div className={styles.manifest}>
                {resourceManifest.map((item) => {
                  const isSelected = workspace.selectedResourceIds.includes(item.id);

                  return (
                    <label
                      key={item.id}
                      className={styles.manifestItem}
                      data-testid={`resource-item-${item.id}`}
                    >
                      <div className={styles.manifestBadge}>{kindLabel[item.kind]}</div>
                      <div className={styles.manifestMeta}>
                        <h3>{item.label}</h3>
                        <p>{item.description}</p>
                        <code>{item.location}</code>
                      </div>
                      <input
                        checked={isSelected}
                        className={styles.checkbox}
                        data-testid={`resource-checkbox-${item.id}`}
                        onChange={() => toggleResource(item.id)}
                        type="checkbox"
                      />
                    </label>
                  );
                })}
              </div>
            </section>

            <section className={`${styles.panel} ${styles.card}`}>
              <div className={styles.sectionTitle}>
                <h2>Verification Checklist</h2>
                <span>Persisted across refreshes</span>
              </div>
              <div className={styles.checklist}>
                {checklistItems.map((item) => (
                  <label
                    key={item.id}
                    className={styles.checklistItem}
                    data-testid={`checklist-item-${item.id}`}
                  >
                    <input
                      checked={workspace.checklist[item.id] ?? false}
                      className={styles.checkbox}
                      data-testid={`checklist-checkbox-${item.id}`}
                      onChange={() => toggleChecklist(item.id)}
                      type="checkbox"
                    />
                    <div>
                      <h3>{item.label}</h3>
                      <p>{item.outcome}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <section className={`${styles.panel} ${styles.card}`}>
            <div className={styles.sectionTitle}>
              <h2>Iteration Workspace</h2>
              <span>Local-first draft state</span>
            </div>
            <div className={styles.workspaceFields}>
              <div className={styles.field}>
                <label htmlFor="goal">Iteration goal</label>
                <input
                  data-testid="goal-input"
                  id="goal"
                  onChange={(event) => setGoal(event.target.value)}
                  value={workspace.goal}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="notes">Working notes</label>
                <textarea
                  data-testid="notes-input"
                  id="notes"
                  onChange={(event) => setNotes(event.target.value)}
                  value={workspace.notes}
                />
              </div>
            </div>

            <div className={styles.actionRow}>
              <button
                className={styles.buttonPrimary}
                data-testid="seed-demo-button"
                onClick={seedDemo}
                type="button"
              >
                Seed demo notes
              </button>
              <button
                className={styles.buttonSecondary}
                data-testid="reset-workspace-button"
                onClick={reset}
                type="button"
              >
                Reset workspace
              </button>
            </div>

            <p className={styles.footerNote}>
              The autonomous entry point is `npm run harness:iterate`. It wraps `codex exec`,
              points the agent at repository-local docs, requires `npm run verify`, and stores the
              run trace under `artifacts/harness/runs/`.
            </p>
          </section>
        </section>
      </main>
    </div>
  );
}
