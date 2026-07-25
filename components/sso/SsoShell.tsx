import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./SsoShell.module.css";

const projects = [
  { name: "iNon", code: "IN", tone: "mint" },
  { name: "Leaf", code: "LF", tone: "leaf" },
  { name: "PINE", code: "PI", tone: "pine" },
  { name: "SAYLESS", code: "SL", tone: "signal" },
  { name: "Treez", code: "TZ", tone: "treez" },
] as const;

interface SsoShellProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

export function SsoShell({
  children,
  eyebrow,
  title,
  description,
}: SsoShellProps) {
  return (
    <main className={styles.viewport}>
      <div className={styles.noise} aria-hidden="true" />
      <section className={styles.shell}>
        <aside className={styles.identity}>
          <Link className={styles.brand} href="/" aria-label="返回 iNon">
            <span className={styles.brandMark}>iN</span>
            <span>
              <strong>iNon</strong>
              <small>One account, five places.</small>
            </span>
          </Link>

          <div className={styles.thesis}>
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>{description}</span>
          </div>

          <div className={styles.projectRail}>
            <div className={styles.railLine} aria-hidden="true" />
            {projects.map((project, index) => (
              <div className={styles.project} key={project.name}>
                <span
                  className={styles.projectNode}
                  data-tone={project.tone}
                >
                  {project.code}
                </span>
                <span>
                  <strong>{project.name}</strong>
                  <small>
                    {index === 0 ? "Identity home" : "Connected project"}
                  </small>
                </span>
              </div>
            ))}
          </div>

          <p className={styles.identityFoot}>
            登录一次，在五个项目之间保持同一个你。
          </p>
        </aside>

        <section className={styles.panel}>{children}</section>
      </section>
    </main>
  );
}
