"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { SsoHandoff } from "@/components/sso/SsoHandoff";
import {
  SsoAccountSections,
  type AccountProfile,
  type AccountSession,
} from "@/components/sso/SsoAccountSections";
import { requestSsoJson, SsoApiError } from "@/lib/sso/browser-client";
import { SsoAdminPanel } from "./SsoAdminPanel";

interface SsoAccountClientProps {
  siteKey: string;
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
  const [handoff, setHandoff] = useState<{
    description: string;
    title: string;
  } | null>(null);
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
      setHandoff({
        title: "正在前往 GitHub",
        description: "完成授权后会自动回到 iNon 账号中心。",
      });
      window.setTimeout(() => window.location.assign(response.url!), 280);
    } catch (requestError) {
      setError(messageFrom(requestError));
      setGithubToken(null);
      setBusy(null);
    }
  }

  async function signOut() {
    setBusy("signout");
    setHandoff({
      title: "正在退出 iNon",
      description: "正在安全结束中央登录会话。",
    });
    await requestSsoJson("/auth/sign-out", {
      body: {},
    }).catch(() => undefined);
    window.location.assign("/sso/login");
  }

  if (handoff) {
    return (
      <SsoHandoff
        title={handoff.title}
        description={handoff.description}
      />
    );
  }

  if (error && !profile && busy !== "loading") {
    return (
      <div className="sso-form" role="alert">
        <p className="sso-error">{error}</p>
        <button
          className="sso-button sso-button-secondary"
          type="button"
          onClick={() => {
            setBusy("loading");
            setError(null);
            void loadAccount();
          }}
        >
          重新读取账号
        </button>
      </div>
    );
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

        <SsoAccountSections
          busy={busy}
          challengeVersion={challengeVersion}
          currentPassword={currentPassword}
          githubToken={githubToken}
          mutationToken={mutationToken}
          password={password}
          profile={profile}
          sessions={sessions}
          siteKey={siteKey}
          username={username}
          linkGitHub={linkGitHub}
          revokeSession={revokeSession}
          setCurrentPassword={setCurrentPassword}
          setGithubToken={setGithubToken}
          setMutationToken={setMutationToken}
          setPassword={setPassword}
          setUsername={setUsername}
          signOut={signOut}
          updatePassword={updatePassword}
          updateUsername={updateUsername}
        />
      </div>
    </div>
  );
}
