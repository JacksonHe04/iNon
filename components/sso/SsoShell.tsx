import Link from "next/link";
import type { ReactNode } from "react";
import baseStyles from "./SsoShell.module.css";
import verdantStyles from "./SsoShellVerdant.module.css";

const shellClass = (name: string) =>
  [baseStyles[name], verdantStyles[name]].filter(Boolean).join(" ");

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
    <main className={shellClass("viewport")}>
      <div className={shellClass("noise")} aria-hidden="true" />
      <section className={shellClass("shell")}>
        <aside className={shellClass("identity")}>
          <Link className={shellClass("brand")} href="/" aria-label="返回 iNon">
            <span className={shellClass("brandMark")}>iN</span>
            <span>
              <strong>iNon</strong>
              <small>One account, five places.</small>
            </span>
          </Link>

          <div className={shellClass("thesis")}>
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>{description}</span>
          </div>

          <div className={shellClass("projectRail")}>
            <div className={shellClass("railLine")} aria-hidden="true" />
            {projects.map((project, index) => (
              <div className={shellClass("project")} key={project.name}>
                <span
                  className={shellClass("projectNode")}
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

          <p className={shellClass("identityFoot")}>
            登录一次，在五个项目之间保持同一个你。
          </p>
        </aside>

        <section className={shellClass("panel")}>{children}</section>
      </section>
    </main>
  );
}
