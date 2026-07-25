import type { EmailTemplate } from "./verification-code";

export type SecurityNotificationEvent =
  | "password_updated"
  | "username_updated"
  | "github_linked"
  | "github_unlinked"
  | "session_revoked";

const eventCopy: Record<
  SecurityNotificationEvent,
  { subject: string; description: string }
> = {
  password_updated: {
    subject: "你的 iNon 密码已更新",
    description: "你的 iNon 账号密码刚刚被设置或更新。",
  },
  username_updated: {
    subject: "你的 iNon 用户名已更新",
    description: "你的 iNon 用户名刚刚被更新。",
  },
  github_linked: {
    subject: "GitHub 已绑定到你的 iNon 账号",
    description: "一个 GitHub 身份刚刚绑定到你的 iNon 账号。",
  },
  github_unlinked: {
    subject: "GitHub 已从你的 iNon 账号解绑",
    description: "GitHub 身份刚刚从你的 iNon 账号解绑。",
  },
  session_revoked: {
    subject: "一个 iNon 登录会话已撤销",
    description: "你的一个 iNon 登录会话刚刚被撤销。",
  },
};

export function securityNotificationTemplate(
  event: SecurityNotificationEvent,
): EmailTemplate {
  const copy = eventCopy[event];
  const footer =
    "如果这不是你的操作，请立即通过邮箱验证码重新登录并检查账号安全。";
  return {
    subject: copy.subject,
    text: `${copy.description}\n\n${footer}`,
    html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${copy.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
    <tr>
      <td align="center" style="padding:32px 16px;background-color:#f5f5f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:560px;background-color:#ffffff;border-radius:16px;">
          <tr>
            <td style="padding:32px 32px 12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:30px;color:#1c1917;font-weight:700;">
              iNon
            </td>
          </tr>
          <tr>
            <td style="padding:12px 32px 8px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#44403c;">
              ${copy.description}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#78716c;">
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}
