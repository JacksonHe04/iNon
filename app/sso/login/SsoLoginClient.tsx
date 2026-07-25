"use client";

import { KeyRound, Mail, MoveRight } from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { TurnstileField } from "@/components/sso/TurnstileField";
import { GithubIcon } from "@/components/icons/PlatformIcons";
import { requestSsoJson, SsoApiError } from "@/lib/sso/browser-client";

type LoginMode = "otp" | "password";

interface SsoLoginClientProps {
  resumeUrl: string;
  siteKey: string;
}

interface SessionResponse {
  session: unknown;
  user: unknown;
}

function messageFrom(error: unknown): string {
  if (error instanceof SsoApiError) {
    if (error.status === 429) {
      return "尝试次数过多，请稍后再试。";
    }
    if (error.status === 403) {
      return "安全验证已失效，请重新完成验证。";
    }
  }
  return error instanceof Error
    ? error.message
    : "账号服务未能完成这次操作。";
}

export function SsoLoginClient({
  resumeUrl,
  siteKey,
}: SsoLoginClientProps) {
  const [mode, setMode] = useState<LoginMode>("otp");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [formToken, setFormToken] = useState<string | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [challengeVersion, setChallengeVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [githubBusy, setGithubBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const continueAfterLogin = useCallback(() => {
    window.location.assign(resumeUrl);
  }, [resumeUrl]);

  useEffect(() => {
    requestSsoJson<SessionResponse | null>("/auth/get-session")
      .then((session) => {
        if (session) {
          continueAfterLogin();
        }
      })
      .catch(() => undefined);
  }, [continueAfterLogin]);

  const formAction =
    mode === "password"
      ? "password_login"
      : otpSent
        ? "otp_verify"
        : "otp_send";

  const resetFormChallenge = () => {
    setFormToken(null);
    setChallengeVersion((value) => value + 1);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formToken) {
      setError("请先完成安全验证。");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus(null);

    try {
      if (mode === "otp" && !otpSent) {
        await requestSsoJson("/auth/email-otp/send-verification-otp", {
          body: { email, type: "sign-in" },
          turnstileToken: formToken,
        });
        setOtpSent(true);
        setStatus(`验证码已发送至 ${email.trim()}。`);
        resetFormChallenge();
        return;
      }

      if (mode === "otp") {
        await requestSsoJson("/auth/sign-in/email-otp", {
          body: { email, otp },
          turnstileToken: formToken,
        });
      } else {
        const isEmail = identifier.includes("@");
        await requestSsoJson(
          isEmail ? "/auth/sign-in/email" : "/auth/sign-in/username",
          {
            body: isEmail
              ? { email: identifier, password }
              : { username: identifier, password },
            turnstileToken: formToken,
          },
        );
      }
      continueAfterLogin();
    } catch (requestError) {
      setError(messageFrom(requestError));
      resetFormChallenge();
    } finally {
      setBusy(false);
    }
  }

  async function continueWithGitHub() {
    if (!githubToken) {
      setError("请先完成 GitHub 登录下方的安全验证。");
      return;
    }
    setGithubBusy(true);
    setError(null);
    try {
      const callbackURL = window.location.href;
      const response = await requestSsoJson<{
        redirect: boolean;
        url?: string;
      }>("/auth/sign-in/social", {
        body: {
          provider: "github",
          callbackURL,
          newUserCallbackURL: callbackURL,
        },
        turnstileToken: githubToken,
      });
      if (!response.url) {
        throw new Error("GitHub 登录地址未能生成。");
      }
      window.location.assign(response.url);
    } catch (requestError) {
      setError(messageFrom(requestError));
      setGithubToken(null);
    } finally {
      setGithubBusy(false);
    }
  }

  return (
    <div className="sso-form">
      <header className="sso-form-header">
        <p className="sso-kicker">Account access</p>
        <h2>{otpSent ? "输入六位验证码" : "进入 iNon"}</h2>
        <p>
          {otpSent
            ? "验证成功后会自动注册或登录，无需先设置用户名。"
            : "新用户只需邮箱验证码；已有密码也可以直接登录。"}
        </p>
      </header>

      <div className="sso-tabs" role="tablist" aria-label="登录方式">
        <button
          className="sso-tab"
          data-active={mode === "otp"}
          type="button"
          role="tab"
          aria-selected={mode === "otp"}
          onClick={() => {
            setMode("otp");
            setOtpSent(false);
            setError(null);
            resetFormChallenge();
          }}
        >
          邮箱验证码
        </button>
        <button
          className="sso-tab"
          data-active={mode === "password"}
          type="button"
          role="tab"
          aria-selected={mode === "password"}
          onClick={() => {
            setMode("password");
            setOtpSent(false);
            setError(null);
            resetFormChallenge();
          }}
        >
          密码登录
        </button>
      </div>

      <form className="sso-stack" onSubmit={submit}>
        {mode === "otp" ? (
          <>
            <label className="sso-label">
              邮箱
              <input
                className="sso-input"
                type="email"
                autoComplete="email"
                required
                disabled={otpSent}
                value={email}
                placeholder="you@example.com"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            {otpSent ? (
              <label className="sso-label">
                验证码
                <input
                  className="sso-input"
                  type="text"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  placeholder="000000"
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, ""))
                  }
                />
              </label>
            ) : null}
          </>
        ) : (
          <>
            <label className="sso-label">
              邮箱或用户名
              <input
                className="sso-input"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                placeholder="you@example.com 或用户名"
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </label>
            <label className="sso-label">
              密码
              <input
                className="sso-input"
                type="password"
                autoComplete="current-password"
                minLength={8}
                required
                value={password}
                placeholder="至少 8 个字符"
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          </>
        )}

        <TurnstileField
          key={`${formAction}-${challengeVersion}`}
          action={formAction}
          siteKey={siteKey}
          onToken={setFormToken}
        />
        {status ? <p className="sso-status">{status}</p> : null}
        {error ? <p className="sso-error" role="alert">{error}</p> : null}
        <button
          className="sso-button"
          type="submit"
          disabled={busy || !formToken}
        >
          {busy ? (
            <span className="sso-spinner" aria-hidden="true" />
          ) : mode === "otp" ? (
            <Mail size={15} aria-hidden="true" />
          ) : (
            <KeyRound size={15} aria-hidden="true" />
          )}
          {mode === "otp"
            ? otpSent
              ? "验证并继续"
              : "发送验证码"
            : "使用密码登录"}
          {!busy ? <MoveRight size={15} aria-hidden="true" /> : null}
        </button>
      </form>

      <div className="sso-divider">或者</div>

      <div className="sso-stack">
        <TurnstileField
          action="github_start"
          siteKey={siteKey}
          onToken={setGithubToken}
        />
        <button
          className="sso-button sso-button-secondary"
          type="button"
          disabled={githubBusy || !githubToken}
          onClick={continueWithGitHub}
        >
          {githubBusy ? (
            <span className="sso-spinner" aria-hidden="true" />
          ) : (
            <GithubIcon width={16} height={16} aria-hidden="true" />
          )}
          使用 GitHub 继续
        </button>
      </div>

      <p className="sso-footnote">
        继续即表示你在使用 iNon 的统一账号体系。我们不会向五个项目暴露你的全局管理身份。
      </p>
    </div>
  );
}
