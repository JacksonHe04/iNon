import type { Metadata } from "next";
import { SsoShell } from "@/components/sso/SsoShell";
import { SsoAccountClient } from "./SsoAccountClient";

export const metadata: Metadata = {
  title: "iNon 账号",
  description: "管理你的 iNon 用户名、密码、GitHub 绑定与登录设备。",
};

export default function SsoAccountPage() {
  const siteKey =
    process.env.NEXT_PUBLIC_INON_TURNSTILE_SITE_KEY ??
    (process.env.NODE_ENV === "development"
      ? "1x00000000000000000000AA"
      : "");

  return (
    <SsoShell
      eyebrow="Identity control"
      title="你的身份，归你管理。"
      description="邮箱始终可以用于验证码登录。用户名、密码和 GitHub 都是可选的进入方式。"
    >
      <SsoAccountClient siteKey={siteKey} />
    </SsoShell>
  );
}
