import { SsoHandoff } from "@/components/sso/SsoHandoff";
import { SsoShell } from "@/components/sso/SsoShell";

export default function SsoLoading() {
  return (
    <SsoShell
      eyebrow="iNon identity network"
      title="同一个你，去往五处。"
      description="统一账号页面正在准备中，请稍候。"
    >
      <SsoHandoff
        title="正在准备账号服务"
        description="正在安全读取登录状态与目标项目。"
      />
    </SsoShell>
  );
}
