# iNon SSO 设计自审

- 日期：2026-07-26
- 被审文档：`inon-sso-design.md`
- 需求来源：`/Users/jackson/Codes/native/26-07-26.md`
- 结论：设计覆盖全部已确认需求，可以进入实施计划阶段。

## 1. 需求覆盖矩阵

| 需求 | 设计证据 | 状态 |
|---|---|---|
| 仅接入 iNon、Leaf、PINE、SAYLESS、Treez | 目标、OAuth Client 和实施阶段只列出五个项目 | 通过 |
| 中央代码位于 `iNon/sso/` | 文档元数据和代码组织 | 通过 |
| Cloudflare 托管后端、数据库和会话 | 技术选型、总体架构、职责划分 | 通过 |
| iNon 与五个 Next.js Web 继续部署 Vercel | 总体架构和 Vercel 职责 | 通过 |
| 公开身份统一使用 `inon.space` | 公开地址和 Canonical Origin | 通过 |
| 邮箱验证码注册 | 注册流程 | 通过 |
| 不支持用户名密码注册 | 非目标和认证验收 | 通过 |
| 邮箱验证码登录 | 登录流程 | 通过 |
| 邮箱密码登录 | 登录流程 | 通过 |
| 用户名密码登录 | 登录流程 | 通过 |
| GitHub 登录 | GitHub 登录与绑定、验收 | 通过 |
| 注册后可暂不设置用户名和密码 | 注册和密码规则 | 通过 |
| 一个账号一个邮箱 | 邮箱规则和数据库唯一约束 | 通过 |
| 用户名全局唯一，允许指定字符 | 用户名规则和规范化 | 通过 |
| 用户名滚动 30 天最多修改一次 | 用户名规则和验收 | 通过 |
| 普通用户、项目管理员、全局超级管理员 | 权限设计 | 通过 |
| 超级管理员全局唯一 | 全局角色约束 | 通过 |
| 超级管理员无需 MFA | 非目标和权限设计 | 通过 |
| 项目管理员不能管理其他管理员 | 权限设计和权限验收 | 通过 |
| 首次进入项目自动成为普通成员 | SSO 流程和项目成员模型 | 通过 |
| Leaf Team Member 由 Leaf 管理员管理 | Leaf Team Member 设计 | 通过 |
| 30 天滑动会话、90 天绝对上限 | 会话模型和会话验收 | 通过 |
| 不支持用户自行删除账号 | 非目标和管理员能力 | 通过 |
| 旧用户不迁移密码和会话 | 迁移策略 | 通过 |
| 旧用户重新确认身份 | 用户激活 | 通过 |
| Resend 和指定发件身份 | 邮件体系 | 通过 |
| 无 OAuth 授权页 | OAuth Client 和 SSO 行为 | 通过 |
| 统一组件和共享接入能力 | `contracts`、`next`、`ui` 包 | 通过 |
| Treez 作为首个参考接入 | 实施阶段 D | 通过 |
| 中央稳定后由主 Agent 控制并行接入 | 实施阶段 E | 通过 |
| 阿里云 DNS 由用户手动添加记录 | 手动事项 | 通过 |
| Secret 可读取但不得提交 | Cookie、Token 和安全验收 | 通过 |

## 2. 技术可行性自审

| 项目 | 结论 |
|---|---|
| Cloudflare D1 | Better Auth 已提供 D1 支持；实施时锁定精确版本并验证迁移 |
| OAuth/OIDC Provider | Better Auth OAuth Provider 支持 OAuth 2.1、OIDC、PKCE、JWKS 和 Trusted Client |
| GitHub | Better Auth 提供 GitHub Provider；必须请求 `user:email` 并检查 verified 邮箱 |
| Vercel 路径代理 | External Rewrite 能将 `/api/sso/*` 转发到 Worker；必须建立 `Set-Cookie` 和 Metadata 集成探针 |
| 30/90 会话 | 30 天滑动为框架配置；90 天绝对上限需要额外字段和服务端钩子 |
| D1 原子性 | D1 不支持传统交互式事务；关键状态转换必须使用条件更新/批处理并进行竞态测试 |
| 多项目复用 | 通过共享 Contracts、Next.js SDK 和 UI 包避免五份重复协议代码 |

## 3. 自审发现和修正

本轮发现并修正：

1. 明确 GitHub 必须请求 `user:email` 并只信任 verified 邮箱。
2. 明确 GitHub Access Token 不得明文长期保存。
3. 明确 Better Auth 和相关身份依赖锁定精确版本。
4. 增加 Worker Canonical Origin、CORS 和 Trusted Origins 约束。
5. 增加 Vercel Rewrite 的请求体、Metadata、Host 和 Cookie 集成探针。
6. 明确 OTP 哈希存储。
7. 增加 Authorization Code、Refresh Token 和身份绑定的 D1 并发测试。

## 4. 尚未阻塞实施的后续输入

以下内容现在不需要用户提供：

1. GitHub OAuth Client ID 和 Secret。
2. Resend Domain 返回的 DNS 记录。
3. 生产 Client Secret。

它们只在相应代码完成、回调地址稳定并准备部署时再获取。
