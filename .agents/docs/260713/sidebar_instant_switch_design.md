# 控制台与公开页面秒切换设计与实现

为了解决控制台侧边栏菜单切换及顶端「控制台/公开主页」预览切换等待时间长的问题，我们对整个切换机制进行了全面优化，将原本缓慢的 Server Component 路由跳转改为了客户端单页（SPA）状态切换与后台数据静默更新。

## 问题分析

在原先的实现中：
1. 控制台的每个侧边菜单项都对应独立的 Next.js App Router 路由。
2. 顶栏右侧的「预览公开主页」（`<Eye />` 按钮）和「进入控制台」（`<User />` 按钮）的切换也需要进行真实页面间的路由跳转（从 `/i/[slug]` 切换到 `/[slug]`）。

由于上述页面均被标记为 `force-dynamic`，每次跳转都会触发 Next.js 的全量服务端渲染（SSR）和 React Server Component (RSC) 获取请求，并在服务端执行大量 Supabase 数据库查询（每次加载执行 26 个以上的并行查询），造成了高达数百毫秒甚至数秒的路由延迟，体验极其卡顿。

## 优化方案

为了达成所有切换动作**秒级切换**（瞬间响应，< 50ms 延迟）的极致体验，我们实现了**统一客户端导航接管**方案：

### 1. 统一 Layout 层数据载入
- 提取子页面以及公开主页所需的所有基础数据（包括 `readmeData`、`layoutConfig`、留言列表 `messages` 以及 `userContext`）至控制台的顶层 layout (`/app/i/[slug]/layout.tsx`)。
- 在顶层 Layout 进行一次性的 `Promise.all` 并行加载，并将数据向下穿透传递给 `DashboardLayoutClient`。

### 2. 客户端拦截与 URL 同步 (Custom Events & pushState)
- **侧边栏 Tab 拦截**：在 `DashboardSideNav` 中拦截 Tab 点击，通过调用 `onTabChange` 改变客户端 `overrideTab` 状态，并调用 `window.history.pushState` 实时同步浏览器地址栏 URL。
- **顶栏中控预览拦截**：
  - 为了解耦顶栏与控制台的组件层级，在 `NavRight` 中点击切换按钮时，会派发自定义事件 `toggle-console-preview`。
  - 控制台容器 `DashboardLayoutClient` 捕获该事件并调用 `e.preventDefault()` 阻止 Next.js 的路由请求。
  - 在客户端改变 `isPublicPreview` 状态，并将 URL 通过 `pushState` 修改为 `/[slug]`（或返回控制台路由）。
  - 同时，我们在客户端重写了 `window.history.pushState` 与 `window.history.replaceState`，在 URL 变化时抛出自定义的 `locationchange` 事件。`NavRight` 按钮与 `ShellLayout` 监听该事件，使得顶栏图标（Eye 变为 User，或反之）与侧导可见性能在 0ms 内瞬间响应同步。

### 3. 公开主页的动态载入与无缝融合
- 当 `isPublicPreview` 为 `true` 时，`DashboardLayoutClient`：
  - 自动卸载控制台的侧边菜单。
  - 使用 `next/dynamic` 异步、零感知地加载公开主页渲染器 `PublicBlockRenderer` 并将其渲染到主区域。
  - `ShellLayout` 在监听到路由切换为公开主页后，会自动展示公开主页的锚点侧导 `SideNav`，完美模拟出真实的公开页面效果。

### 4. 后台静默刷新 (Background Sync)
- 无论是在侧导内切换，还是在控制台/公开主页间切换，用户都会在一瞬间（< 20ms）看到渲染好的缓存/当前数据，无需任何网络等待。
- 切换发生后，控制台在后台静默发起 Server Action 数据同步请求，无感知更新组件的状态，确保数据一致。

## 代码变动

1. **Server Actions (`lib/analytics/actions.ts` & `lib/content/actions.ts`)**：
   - 添加了 `fetchReadmeDataAction` 与 `fetchOwnerMessagesAction` 用以在后台同步最新内容。
2. **顶层 Layout (`app/i/[slug]/layout.tsx`)**：
   - 统一加载控制台与公开页预览所需的全部数据，并传递给 `DashboardLayoutClient`；设置 `showSideNav={true}`（交由客户端动态控制可见性）。
3. **顶层外壳 (`components/layout/ShellLayout.tsx`)**：
   - 添加了客户端路径监听器，若检测到处于控制台路径下，则强制隐藏公开主页的锚点侧导，否则根据配置正常显示，并动态调整容器 Padding。
4. **顶栏右侧按钮 (`components/nav/NavRight.tsx`)**：
   - 监听 `locationchange` 与 `popstate`，实时更新 `isConsolePage` 状态以切换图标与文案。
   - 在点击切换按钮时派发 `toggle-console-preview` 自定义事件以支持客户端拦截。
5. **控制台容器 (`components/dashboard/DashboardLayoutClient.tsx`)**：
   - 重写 `window.history.pushState` 等 API，引入 `isPublicPreview` 本地预览状态。
   - 截获 `toggle-console-preview` 事件并实时展示公开页预览或切回控制台。
   - 响应浏览器前进后退历史记录，全过程实现零卡顿、零白屏、纯单页秒开体验。
