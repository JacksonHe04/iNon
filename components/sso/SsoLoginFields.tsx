interface SsoLoginFieldsProps {
  email: string;
  identifier: string;
  mode: 'otp' | 'password';
  otp: string;
  otpSent: boolean;
  password: string;
  setEmail: (value: string) => void;
  setIdentifier: (value: string) => void;
  setOtp: (value: string) => void;
  setPassword: (value: string) => void;
}

export function SsoLoginFields({
  email,
  identifier,
  mode,
  otp,
  otpSent,
  password,
  setEmail,
  setIdentifier,
  setOtp,
  setPassword,
}: SsoLoginFieldsProps) {
  if (mode === 'otp') {
    return (
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
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
            />
          </label>
        ) : null}
      </>
    );
  }

  return (
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
  );
}
