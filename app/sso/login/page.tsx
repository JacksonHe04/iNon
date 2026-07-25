import type { Metadata } from "next";
import { SsoShell } from "@/components/sso/SsoShell";
import { SsoLoginClient } from "./SsoLoginClient";

export const metadata: Metadata = {
  title: "登录 iNon",
  description: "使用同一个 iNon 账号进入 iNon、Leaf、PINE、SAYLESS 和 Treez。",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function buildResumeUrl(
  params: Record<string, string | string[] | undefined>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      query.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    }
  }
  if (query.has("client_id") && query.has("sig")) {
    return `/api/sso/auth/oauth2/authorize?${query.toString()}`;
  }

  const returnTo = query.get("returnTo");
  return returnTo?.startsWith("/") && !returnTo.startsWith("//")
    ? returnTo
    : "/sso/account";
}

export default async function SsoLoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;
  const siteKey =
    process.env.NEXT_PUBLIC_INON_TURNSTILE_SITE_KEY ??
    (process.env.NODE_ENV === "development"
      ? "1x00000000000000000000AA"
      : "");

  return (
    <SsoShell
      eyebrow="iNon identity network"
      title="同一个你，去往五处。"
      description="邮箱是账号的根。你可以只用验证码，也可以稍后设置用户名与密码，再绑定 GitHub。"
    >
      <SsoLoginClient
        resumeUrl={buildResumeUrl(params)}
        siteKey={siteKey}
      />
    </SsoShell>
  );
}
