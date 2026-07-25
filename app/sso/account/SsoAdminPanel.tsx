"use client";

import { Crown, Search, Shield, ShieldOff } from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { TurnstileField } from "@/components/sso/TurnstileField";
import { requestSsoJson, SsoApiError } from "@/lib/sso/browser-client";

const projects = [
  { key: "inon", name: "iNon" },
  { key: "leaf", name: "Leaf" },
  { key: "pine", name: "PINE" },
  { key: "sayless", name: "SAYLESS" },
  { key: "treez", name: "Treez" },
] as const;

type ProjectKey = (typeof projects)[number]["key"];
type ProjectRole = "member" | "admin";

interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  status: "active" | "disabled";
  globalRole: "super_admin" | null;
  projectRoles: Partial<Record<ProjectKey, ProjectRole>>;
}

interface SsoAdminPanelProps {
  siteKey: string;
}

function adminErrorMessage(error: unknown): string {
  if (error instanceof SsoApiError) {
    if (error.status === 403) {
      return "仅全局超级管理员可以管理项目管理员。";
    }
    if (error.status === 429) {
      return "操作过于频繁，请稍后再试。";
    }
  }
  return error instanceof Error
    ? error.message
    : "管理员控制面未能完成这次操作。";
}

export function SsoAdminPanel({ siteKey }: SsoAdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [mutationToken, setMutationToken] = useState<string | null>(null);
  const [challengeVersion, setChallengeVersion] = useState(0);
  const [busy, setBusy] = useState<string | null>("loading");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const loadUsers = useCallback(async (search = "") => {
    setBusy("loading");
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) {
        params.set("query", search.trim());
      }
      const result = await requestSsoJson<{ users: AdminUser[] }>(
        `/admin/users${params.size > 0 ? `?${params}` : ""}`,
      );
      setUsers(result.users);
    } catch (requestError) {
      setError(adminErrorMessage(requestError));
    } finally {
      setBusy(null);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function searchUsers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadUsers(query);
  }

  async function updateRole(
    user: AdminUser,
    project: ProjectKey,
    role: ProjectRole,
  ) {
    if (!mutationToken) {
      setError("请先完成管理员操作的安全验证。");
      return;
    }

    const operation = `${user.id}:${project}`;
    setBusy(operation);
    setError(null);
    setStatus(null);
    try {
      await requestSsoJson(
        `/admin/projects/${project}/users/${encodeURIComponent(user.id)}/role`,
        {
          body: { role },
          turnstileToken: mutationToken,
        },
      );
      setStatus(
        role === "admin"
          ? `已将 ${user.username ?? user.email} 设为 ${project} 管理员。`
          : `已撤销 ${user.username ?? user.email} 的 ${project} 管理员权限。`,
      );
      await loadUsers(query);
    } catch (requestError) {
      setError(adminErrorMessage(requestError));
    } finally {
      setBusy(null);
      setMutationToken(null);
      setChallengeVersion((value) => value + 1);
    }
  }

  return (
    <section className="sso-card sso-admin-card">
      <div className="sso-card-head">
        <div>
          <h3>
            <Crown size={14} aria-hidden="true" /> 项目管理员
          </h3>
          <p>仅你可以任命或撤销五个项目的管理员。</p>
        </div>
        <span className="sso-badge">Super admin</span>
      </div>

      <form className="sso-admin-search" onSubmit={searchUsers}>
        <input
          className="sso-input"
          value={query}
          placeholder="按邮箱或用户名查找"
          aria-label="按邮箱或用户名查找用户"
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          className="sso-button sso-button-secondary"
          type="submit"
          disabled={busy === "loading"}
        >
          <Search size={14} aria-hidden="true" />
          查找
        </button>
      </form>

      {status ? <p className="sso-status">{status}</p> : null}
      {error ? <p className="sso-error" role="alert">{error}</p> : null}

      {busy === "loading" ? (
        <p className="sso-footnote">正在读取中央用户目录…</p>
      ) : (
        <div className="sso-admin-users">
          {users.map((user) => (
            <article className="sso-admin-user" key={user.id}>
              <header>
                <div>
                  <strong>{user.username ?? "邮箱账号"}</strong>
                  <small>{user.email}</small>
                </div>
                {user.globalRole ? (
                  <span className="sso-badge">Global owner</span>
                ) : user.status === "disabled" ? (
                  <span className="sso-badge">Disabled</span>
                ) : null}
              </header>

              {user.globalRole ? (
                <p>全局超级管理员自动拥有所有项目的管理员能力。</p>
              ) : (
                <div className="sso-admin-projects">
                  {projects.map((project) => {
                    const currentRole =
                      user.projectRoles[project.key] ?? "member";
                    const nextRole =
                      currentRole === "admin" ? "member" : "admin";
                    const operation = `${user.id}:${project.key}`;
                    return (
                      <div key={project.key}>
                        <span>
                          <strong>{project.name}</strong>
                          <small>
                            {currentRole === "admin"
                              ? "项目管理员"
                              : "普通成员"}
                          </small>
                        </span>
                        <button
                          className="sso-link-button"
                          type="button"
                          disabled={
                            busy === operation ||
                            mutationToken === null
                          }
                          onClick={() =>
                            updateRole(user, project.key, nextRole)
                          }
                        >
                          {currentRole === "admin" ? (
                            <ShieldOff size={12} aria-hidden="true" />
                          ) : (
                            <Shield size={12} aria-hidden="true" />
                          )}
                          {currentRole === "admin" ? "撤销" : "任命"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          ))}
          {users.length === 0 ? (
            <p className="sso-footnote">没有找到匹配的账号。</p>
          ) : null}
        </div>
      )}

      <div className="sso-admin-challenge">
        <p>每次管理员变更都需要独立安全验证。</p>
        <TurnstileField
          key={`admin-mutation-${challengeVersion}`}
          action="account_mutation"
          siteKey={siteKey}
          onToken={setMutationToken}
        />
      </div>
    </section>
  );
}
