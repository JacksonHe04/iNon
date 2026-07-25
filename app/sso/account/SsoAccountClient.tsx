"use client";

import {
  KeyRound,
  Laptop,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { TurnstileField } from "@/components/sso/TurnstileField";
import { GithubIcon } from "@/components/icons/PlatformIcons";
import { requestSsoJson, SsoApiError } from "@/lib/sso/browser-client";
import { SsoAdminPanel } from "./SsoAdminPanel";

interface AccountProfile {
  user: {
    id: string;
    email: string;
    username: string | null;
  };
  hasPassword: boolean;
  githubLinked: boolean;
  globalRole: "super_admin" | null;
}

interface AccountSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  current: boolean;
}

interface SsoAccountClientProps {
  siteKey: string;
}

function describeDevice(userAgent: string | null): string {
  if (!userAgent) {
    return "未知设备";
  }
  const browser = userAgent.includes("Firefox")
    ? "Firefox"
    : userAgent.includes("Edg/")
      ? "Edge"
      : userAgent.includes("Chrome")
        ? "Chrome"
        : userAgent.includes("Safari")
          ? "Safari"
          : "浏览器";
  const system = userAgent.includes("iPhone")
    ? "iPhone"
    : userAgent.includes("Android")
      ? "Android"
      : userAgent.includes("Mac")
        ? "Mac"
        : userAgent.includes("Windows")
          ? "Windows"
          : "设备";
  return `${browser} · ${system}`;
}

function messageFrom(error: unknown): string {
  if (error instanceof SsoApiError) {
    if (error.status === 401) {
      return "登录状态已失效，请重新登录。";
    }
    if (error.status === 429) {
      return "操作过于频繁，请稍后再试。";
    }
    if (error.status === 403) {
      return "安全验证已失效，请重新完成验证。";
    }
  }
  return error instanceof Error
    ? error.message
    : "账号服务未能完成这次操作。";
}

export function SsoAccountClient({ siteKey }: SsoAccountClientProps) {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [mutationToken, setMutationToken] = useState<string | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [challengeVersion, setChallengeVersion] = useState(0);
  const [busy, setBusy] = useState<string | null>("loading");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const loadAccount = useCallback(async () => {
    try {
      const [nextProfile, sessionResult] = await Promise.all([
        requestSsoJson<AccountProfile>("/account/profile"),
        requestSsoJson<{ sessions: AccountSession[] }>(
          "/account/sessions",
        ),
      ]);
      setProfile(nextProfile);
      setUsername(nextProfile.user.username ?? "");
      setSessions(sessionResult.sessions);
    } catch (requestError) {
      if (
        requestError instanceof SsoApiError &&
        requestError.status === 401
      ) {
        window.location.assign("/sso/login?returnTo=/sso/account");
        return;
      }
      setError(messageFrom(requestError));
    } finally {
      setBusy(null);
    }
  }, []);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const resetMutationChallenge = () => {
    setMutationToken(null);
    setChallengeVersion((value) => value + 1);
  };

  async function updateUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mutationToken) {
      setError("请先完成安全验证。");
      return;
    }
    setBusy("username");
    setError(null);
    setStatus(null);
    try {
      await requestSsoJson("/account/username", {
        body: { username },
        turnstileToken: mutationToken,
      });
      setStatus("用户名已更新。下次修改需等待 30 天。");
      await loadAccount();
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setBusy(null);
      resetMutationChallenge();
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mutationToken) {
      setError("请先完成安全验证。");
      return;
    }
    setBusy("password");
    setError(null);
    setStatus(null);
    try {
      await requestSsoJson("/account/password", {
        body: {
          password,
          ...(profile?.hasPassword ? { currentPassword } : {}),
        },
        turnstileToken: mutationToken,
      });
      setPassword("");
      setCurrentPassword("");
      setStatus(profile?.hasPassword ? "密码已更新。" : "密码已设置。");
      await loadAccount();
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setBusy(null);
      resetMutationChallenge();
    }
  }

  async function revokeSession(sessionId: string) {
    if (!mutationToken) {
      setError("请先完成安全验证。");
      return;
    }
    setBusy(sessionId);
    setError(null);
    setStatus(null);
    try {
      await requestSsoJson(
        `/account/sessions/${encodeURIComponent(sessionId)}/revoke`,
        {
          body: {},
          turnstileToken: mutationToken,
        },
      );
      setStatus("该设备的登录会话已撤销。");
      await loadAccount();
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setBusy(null);
      resetMutationChallenge();
    }
  }

  async function linkGitHub() {
    if (!githubToken) {
      setError("请先完成 GitHub 绑定下方的安全验证。");
      return;
    }
    setBusy("github");
    setError(null);
    try {
      const callbackURL = `${window.location.origin}/sso/account`;
      const response = await requestSsoJson<{
        redirect: boolean;
        url?: string;
      }>("/auth/link-social", {
        body: { provider: "github", callbackURL },
        turnstileToken: githubToken,
      });
      if (!response.url) {
        throw new Error("GitHub 绑定地址未能生成。");
      }
      window.location.assign(response.url);
    } catch (requestError) {
      setError(messageFrom(requestError));
      setGithubToken(null);
      setBusy(null);
    }
  }

  async function signOut() {
    setBusy("signout");
    await requestSsoJson("/auth/sign-out", {
      body: {},
    }).catch(() => undefined);
    window.location.assign("/sso/login");
  }

  if (!profile || busy === "loading") {
    return (
      <div className="sso-form" aria-live="polite">
        <span className="sso-spinner" aria-hidden="true" />
        <p className="sso-footnote">正在读取你的 iNon 账号…</p>
      </div>
    );
  }

  return (
    <div className="sso-account">
      <header className="sso-form-header">
        <p className="sso-kicker">Account security</p>
        <h2>{profile.user.username ?? "邮箱账号"}</h2>
        <p>{profile.user.email}</p>
      </header>

      {status ? <p className="sso-status">{status}</p> : null}
      {error ? <p className="sso-error" role="alert">{error}</p> : null}

      <div className="sso-account-grid" style={{ marginTop: 18 }}>
        {profile.globalRole === "super_admin" ? (
          <SsoAdminPanel siteKey={siteKey} />
        ) : null}

        <section className="sso-card">
          <div className="sso-card-head">
            <div>
              <h3><UserRound size={14} aria-hidden="true" /> 用户名</h3>
              <p>全局唯一，可使用中英文、数字、下划线和短横线。</p>
            </div>
            <span className="sso-badge">30 days</span>
          </div>
          <form className="sso-stack" onSubmit={updateUsername}>
            <input
              className="sso-input"
              value={username}
              required
              placeholder="设置用户名"
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
            />
            <button
              className="sso-button sso-button-secondary"
              type="submit"
              disabled={busy === "username" || !mutationToken}
            >
              {busy === "username" ? (
                <span className="sso-spinner" aria-hidden="true" />
              ) : (
                <UserRound size={14} aria-hidden="true" />
              )}
              保存用户名
            </button>
          </form>
        </section>

        <section className="sso-card">
          <div className="sso-card-head">
            <div>
              <h3><KeyRound size={14} aria-hidden="true" /> 密码</h3>
              <p>
                {profile.hasPassword
                  ? "修改密码会撤销其他设备上的会话。"
                  : "可选。设置后可使用邮箱或用户名加密码登录。"}
              </p>
            </div>
            <span className="sso-badge">
              {profile.hasPassword ? "Enabled" : "Optional"}
            </span>
          </div>
          <form className="sso-stack" onSubmit={updatePassword}>
            {profile.hasPassword ? (
              <input
                className="sso-input"
                type="password"
                minLength={8}
                required
                autoComplete="current-password"
                value={currentPassword}
                placeholder="当前密码"
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
              />
            ) : null}
            <input
              className="sso-input"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              value={password}
              placeholder="新密码，至少 8 个字符"
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className="sso-button sso-button-secondary"
              type="submit"
              disabled={busy === "password" || !mutationToken}
            >
              {busy === "password" ? (
                <span className="sso-spinner" aria-hidden="true" />
              ) : (
                <KeyRound size={14} aria-hidden="true" />
              )}
              {profile.hasPassword ? "更新密码" : "设置密码"}
            </button>
          </form>
        </section>

        <section className="sso-card">
          <div className="sso-card-head">
            <div>
              <h3><GithubIcon width={14} height={14} aria-hidden="true" /> GitHub</h3>
              <p>绑定后可以直接用 GitHub 进入同一个 iNon 账号。</p>
            </div>
            <span className="sso-badge">
              {profile.githubLinked ? "Linked" : "Not linked"}
            </span>
          </div>
          {profile.githubLinked ? (
            <p className="sso-status">GitHub 已绑定。</p>
          ) : (
            <div className="sso-stack">
              <TurnstileField
                action="github_start"
                siteKey={siteKey}
                onToken={setGithubToken}
              />
              <button
                className="sso-button sso-button-secondary"
                type="button"
                disabled={busy === "github" || !githubToken}
                onClick={linkGitHub}
              >
                <GithubIcon width={14} height={14} aria-hidden="true" />
                绑定 GitHub
              </button>
            </div>
          )}
        </section>

        <section className="sso-card">
          <div className="sso-card-head">
            <div>
              <h3><Laptop size={14} aria-hidden="true" /> 登录设备</h3>
              <p>中央会话 30 天滑动有效，最长不超过 90 天。</p>
            </div>
            <span className="sso-badge">{sessions.length} active</span>
          </div>
          <div className="sso-session-list">
            {sessions.map((session) => (
              <div className="sso-session" key={session.id}>
                <div>
                  <strong>
                    {describeDevice(session.userAgent)}
                    {session.current ? " · 当前设备" : ""}
                  </strong>
                  <small>
                    最近活动{" "}
                    {new Intl.DateTimeFormat("zh-CN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(session.updatedAt))}
                  </small>
                </div>
                {!session.current ? (
                  <button
                    className="sso-link-button"
                    type="button"
                    disabled={busy === session.id || !mutationToken}
                    onClick={() => revokeSession(session.id)}
                  >
                    撤销
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="sso-card">
          <div className="sso-card-head">
            <div>
              <h3><ShieldCheck size={14} aria-hidden="true" /> 安全验证</h3>
              <p>用户名、密码和设备操作会各自消耗一次验证结果。</p>
            </div>
          </div>
          <TurnstileField
            key={`account-mutation-${challengeVersion}`}
            action="account_mutation"
            siteKey={siteKey}
            onToken={setMutationToken}
          />
        </section>

        <div className="sso-account-actions">
          <button
            className="sso-button sso-button-secondary"
            type="button"
            disabled={busy === "signout"}
            onClick={signOut}
          >
            <LogOut size={14} aria-hidden="true" />
            退出当前设备
          </button>
        </div>
      </div>
    </div>
  );
}
