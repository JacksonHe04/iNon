import type { VerificationOTPMessage } from "../../auth/create-auth";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const purposeByType: Record<VerificationOTPMessage["type"], string> = {
  "sign-in": "登录或注册 iNon",
  "email-verification": "验证你的 iNon 邮箱",
  "forget-password": "重置你的 iNon 密码",
  "change-email": "更改你的 iNon 邮箱",
};

export function verificationCodeTemplate(
  message: VerificationOTPMessage,
): EmailTemplate {
  const purpose = purposeByType[message.type];
  const subject = `你的 iNon 验证码：${message.otp}`;
  const text = `${purpose}\n\n验证码：${message.otp}\n\n验证码将在 10 分钟后失效。若非本人操作，请忽略此邮件。`;
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
    <tr>
      <td align="center" style="padding-top:32px;padding-right:16px;padding-bottom:32px;padding-left:16px;background-color:#f5f5f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:560px;background-color:#ffffff;border-radius:16px;">
          <tr>
            <td style="padding-top:32px;padding-right:32px;padding-bottom:12px;padding-left:32px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:30px;color:#1c1917;font-weight:700;">
              iNon
            </td>
          </tr>
          <tr>
            <td style="padding-top:12px;padding-right:32px;padding-bottom:8px;padding-left:32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#44403c;">
              ${purpose}
            </td>
          </tr>
          <tr>
            <td style="padding-top:12px;padding-right:32px;padding-bottom:12px;padding-left:32px;font-family:Arial,Helvetica,sans-serif;font-size:34px;line-height:42px;letter-spacing:8px;color:#1c1917;font-weight:700;">
              ${message.otp}
            </td>
          </tr>
          <tr>
            <td style="padding-top:8px;padding-right:32px;padding-bottom:32px;padding-left:32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#78716c;">
              验证码将在 10 分钟后失效。若非本人操作，请忽略此邮件。
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}
