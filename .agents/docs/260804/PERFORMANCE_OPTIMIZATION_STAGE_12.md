# 性能优化第十二阶段：档案首屏

日期：2026-08-04

## 目标

将优化范围从 3D 世界扩展到默认档案模式，降低长页面的首屏布局、绘制、图片解码、JavaScript 下载与共享装饰纹理体积。音乐、影视和书籍收藏的展示结构必须保持。

## 档案模式基线

内置浏览器打开 `http://localhost:3000/`，稳定后记录：

- DOM 节点：2011；
- `<img>` 元素：34；
- 页面包含全部可见 Block；
- 世界模式生产分块中 Rapier 约 2.24 MB，Three.js/React Three 约 870 KB；
- 页面原本在 1.5 秒后无条件空闲预加载整套世界运行时。

## 实施内容

### 1. 浏览器原生离屏 Block 渲染跳过

所有 `.archive-block-frame` 使用：

- `content-visibility: auto`；
- 普通 Block 的 remembered intrinsic block size 为 860px；
- full layout 的 remembered intrinsic block size 为 1100px。

React 和语义 DOM 保持完整，但浏览器可跳过视口外 Block 的布局、绘制与命中测试。这样不会牺牲服务端内容、搜索语义或用户的完整档案。

内置浏览器验收：

1. 首屏个人档案与项目卡片保持原排版。
2. 定位“音乐收藏”后，专辑封面网格正常恢复。
3. 定位“影视收藏”后，影视卡片和相邻书单封面正常恢复。

### 2. 收藏图片低优先级异步解码

复用的 `BlockImage` 与链接图标增加：

- `loading="lazy"`；
- `decoding="async"`；
- `fetchPriority="low"`。

这让首屏字体、布局和核心样式优先于离屏收藏封面，同时保留原有错误回退。

### 3. 世界运行时只在用户意图后加载

移除了档案模式挂载 1.5 秒后执行的 `loadArchiveWorld()` 空闲预热。

结果：

- 默认档案不再下载约 3.1 MB 的 Rapier 与 React Three 主分块；
- 点击“世界”后仍由既有 dynamic import 加载；
- 世界加载文案和错误边界保持；
- 内置浏览器等待 5 秒确认档案仍无 3D 状态，点击后正常进入 WebGL live。

### 4. 复古装饰图集压缩

共享 `ephemera-sheet`：

- PNG：1,571,052 bytes；
- WebP：327,942 bytes；
- 减少 1,243,110 bytes，约 79.1%；
- 像素尺寸保持 1536×1024；
- 透明植物、枝条、鸟、邮票与旧纸边缘保留。

所有公开档案、控制台、后台和 SSO 样式引用已统一迁移，旧 PNG 已从仓库移除，但可通过 Git 恢复。

### 5. 木纤维底纹重压缩

共享 `weathered-wood-fiber`：

- 原文件：453,762 bytes；
- 新文件：284,170 bytes；
- 减少 169,592 bytes，约 37.4%；
- 尺寸保持 1254×1254；
- 浏览器首屏截图中纤维、磨损和灰绿底色无可见变化。

## 总体收益

第十二阶段在档案默认路径至少避免或移除：

- 世界主运行时分块约 3,106,054 bytes；
- 两张共享纹理 1,412,702 bytes；
- 合计约 4,518,756 bytes（约 4.52 MB，未计世界其他辅助分块）。

离屏 Block 的布局与绘制节省不计入上述网络体积。

## 视觉与功能验收

- 首屏复古绿色、旧纸、植物、枝条和颗粒材质保持。
- Block 仍保持错位、跨栏、叠放和批注结构。
- 音乐收藏专辑网格完整。
- 影视收藏与书单卡片完整。
- 点击世界模式仍能进入 3D 开放世界。

## 构建与约束

`pnpm build` 通过：

- Next.js 16.2.10；
- production compile：5.1s；
- TypeScript：5.9s；
- 12 个静态页面：84ms。

运行时代码目录最大文件仍为 300 行，没有文件超过限制。

## 对应提交

- `9050c8d` `perf(archive): skip offscreen block rendering`
- `8631009` `perf(archive): deprioritize collection imagery`
- `bb58ebd` `perf(archive): load the world only on intent`
- `d27e4e3` `perf(archive): compress the ephemera atlas`
- `1bfd5d9` `perf(archive): recompress the wood fiber texture`
