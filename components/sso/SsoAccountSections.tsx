import type { FormEvent } from 'react';
import { KeyRound, Laptop, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { GithubIcon } from '@/components/icons/PlatformIcons';
import { TurnstileField } from '@/components/sso/TurnstileField';

export interface AccountProfile {
  user: { id: string; email: string; username: string | null };
  hasPassword: boolean;
  githubLinked: boolean;
  globalRole: 'super_admin' | null;
}

export interface AccountSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  current: boolean;
}

function describeDevice(userAgent: string | null): string {
  if (!userAgent) return '未知设备';
  const browser = userAgent.includes('Firefox')
    ? 'Firefox'
    : userAgent.includes('Edg/')
      ? 'Edge'
      : userAgent.includes('Chrome')
        ? 'Chrome'
        : userAgent.includes('Safari')
          ? 'Safari'
          : '浏览器';
  const system = userAgent.includes('iPhone')
    ? 'iPhone'
    : userAgent.includes('Android')
      ? 'Android'
      : userAgent.includes('Mac')
        ? 'Mac'
        : userAgent.includes('Windows')
          ? 'Windows'
          : '设备';
  return `${browser} · ${system}`;
}

interface SsoAccountSectionsProps {
  busy: string | null;
  challengeVersion: number;
  currentPassword: string;
  githubToken: string | null;
  mutationToken: string | null;
  password: string;
  profile: AccountProfile;
  sessions: AccountSession[];
  siteKey: string;
  username: string;
  linkGitHub: () => void;
  revokeSession: (sessionId: string) => void;
  setCurrentPassword: (value: string) => void;
  setGithubToken: (value: string | null) => void;
  setMutationToken: (value: string | null) => void;
  setPassword: (value: string) => void;
  setUsername: (value: string) => void;
  signOut: () => void;
  updatePassword: (event: FormEvent<HTMLFormElement>) => void;
  updateUsername: (event: FormEvent<HTMLFormElement>) => void;
}

export function SsoAccountSections(props: SsoAccountSectionsProps) {
  const { busy, challengeVersion, currentPassword, githubToken, mutationToken, password,
    profile, sessions, siteKey, username, linkGitHub, revokeSession, setCurrentPassword,
    setGithubToken, setMutationToken, setPassword, setUsername, signOut, updatePassword,
    updateUsername } = props;

  return (
    <>
      <section className="sso-card">
        <div className="sso-card-head">
          <div><h3><UserRound size={14} aria-hidden="true" /> 用户名</h3><p>全局唯一，可使用中英文、数字、下划线和短横线。</p></div>
          <span className="sso-badge">30 days</span>
        </div>
        <form className="sso-stack" onSubmit={updateUsername}>
          <input className="sso-input" value={username} required placeholder="设置用户名" autoComplete="username" onChange={(event) => setUsername(event.target.value)} />
          <button className="sso-button sso-button-secondary" type="submit" disabled={busy === 'username' || !mutationToken}>
            {busy === 'username' ? <span className="sso-spinner" aria-hidden="true" /> : <UserRound size={14} aria-hidden="true" />} 保存用户名
          </button>
        </form>
      </section>

      <section className="sso-card">
        <div className="sso-card-head">
          <div><h3><KeyRound size={14} aria-hidden="true" /> 密码</h3><p>{profile.hasPassword ? '修改密码会撤销其他设备上的会话。' : '可选。设置后可使用邮箱或用户名加密码登录。'}</p></div>
          <span className="sso-badge">{profile.hasPassword ? 'Enabled' : 'Optional'}</span>
        </div>
        <form className="sso-stack" onSubmit={updatePassword}>
          {profile.hasPassword ? <input className="sso-input" type="password" minLength={8} required autoComplete="current-password" value={currentPassword} placeholder="当前密码" onChange={(event) => setCurrentPassword(event.target.value)} /> : null}
          <input className="sso-input" type="password" minLength={8} required autoComplete="new-password" value={password} placeholder="新密码，至少 8 个字符" onChange={(event) => setPassword(event.target.value)} />
          <button className="sso-button sso-button-secondary" type="submit" disabled={busy === 'password' || !mutationToken}>
            {busy === 'password' ? <span className="sso-spinner" aria-hidden="true" /> : <KeyRound size={14} aria-hidden="true" />} {profile.hasPassword ? '更新密码' : '设置密码'}
          </button>
        </form>
      </section>

      <section className="sso-card">
        <div className="sso-card-head">
          <div><h3><GithubIcon width={14} height={14} aria-hidden="true" /> GitHub</h3><p>绑定后可以直接用 GitHub 进入同一个 iNon 账号。</p></div>
          <span className="sso-badge">{profile.githubLinked ? 'Linked' : 'Not linked'}</span>
        </div>
        {profile.githubLinked ? <p className="sso-status">GitHub 已绑定。</p> : (
          <div className="sso-stack">
            <TurnstileField action="github_start" siteKey={siteKey} onToken={setGithubToken} />
            <button className="sso-button sso-button-secondary" type="button" disabled={busy === 'github' || !githubToken} onClick={linkGitHub}>
              <GithubIcon width={14} height={14} aria-hidden="true" /> 绑定 GitHub
            </button>
          </div>
        )}
      </section>

      <section className="sso-card">
        <div className="sso-card-head">
          <div><h3><Laptop size={14} aria-hidden="true" /> 登录设备</h3><p>中央会话 30 天滑动有效，最长不超过 90 天。</p></div>
          <span className="sso-badge">{sessions.length} active</span>
        </div>
        <div className="sso-session-list">
          {sessions.map((session) => (
            <div className="sso-session" key={session.id}>
              <div>
                <strong>{describeDevice(session.userAgent)}{session.current ? ' · 当前设备' : ''}</strong>
                <small>最近活动 {new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(session.updatedAt))}</small>
              </div>
              {!session.current ? <button className="sso-link-button" type="button" disabled={busy === session.id || !mutationToken} onClick={() => revokeSession(session.id)}>撤销</button> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="sso-card">
        <div className="sso-card-head"><div><h3><ShieldCheck size={14} aria-hidden="true" /> 安全验证</h3><p>用户名、密码和设备操作会各自消耗一次验证结果。</p></div></div>
        <TurnstileField key={`account-mutation-${challengeVersion}`} action="account_mutation" siteKey={siteKey} onToken={setMutationToken} />
      </section>

      <div className="sso-account-actions">
        <button className="sso-button sso-button-secondary" type="button" disabled={busy === 'signout'} onClick={signOut}>
          <LogOut size={14} aria-hidden="true" /> 退出当前设备
        </button>
      </div>
    </>
  );
}
