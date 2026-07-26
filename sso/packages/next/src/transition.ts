import type { InonSsoTransitionAction, ProjectKey } from "./types.js";

const PROJECT_NAMES: Record<ProjectKey, string> = {
  inon: "iNon",
  leaf: "Leaf",
  pine: "PINE",
  sayless: "SAYLESS",
  treez: "Treez",
};

const TRANSITION_COPY: Record<
  InonSsoTransitionAction,
  {
    eyebrow: string;
    title(projectName: string): string;
    description(projectName: string): string;
    status: string;
  }
> = {
  login: {
    eyebrow: "iNon account",
    title: () => "正在连接 iNon",
    description: (projectName) =>
      `正在安全地将你从 ${projectName} 送往统一账号服务。`,
    status: "正在检查中央登录会话",
  },
  refresh: {
    eyebrow: "Session refresh",
    title: () => "正在恢复登录状态",
    description: (projectName) =>
      `正在为 ${projectName} 安全刷新当前账号会话。`,
    status: "正在同步账号与项目权限",
  },
  logout: {
    eyebrow: "Secure sign out",
    title: (projectName) => `正在退出 ${projectName}`,
    description: () =>
      "只会结束当前项目会话，不会影响你在其他 iNon 项目的登录状态。",
    status: "正在安全清理当前项目会话",
  },
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function scriptString(value: string): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function transitionResponse(options: {
  action: InonSsoTransitionAction;
  destination: string;
  project: ProjectKey;
}): Response {
  const projectName = PROJECT_NAMES[options.project];
  const copy = TRANSITION_COPY[options.action];
  const title = copy.title(projectName);
  const description = copy.description(projectName);
  const destinationAttribute = escapeHtml(options.destination);
  const destinationScript = scriptString(options.destination);

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta http-equiv="refresh" content="4;url=${destinationAttribute}">
    <title>${escapeHtml(title)} · iNon</title>
    <style>
      :root {
        color: #14231d;
        background: #edf3ef;
        font-family: "Geist", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
      }
      * { box-sizing: border-box; }
      body {
        min-height: 100svh;
        margin: 0;
        display: grid;
        place-items: center;
        overflow: hidden;
        background:
          radial-gradient(circle at 16% 12%, rgba(36, 151, 112, .14), transparent 32rem),
          radial-gradient(circle at 88% 88%, rgba(112, 133, 103, .16), transparent 30rem),
          #edf3ef;
      }
      .grain {
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: .18;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.16'/%3E%3C/svg%3E");
      }
      main {
        position: relative;
        width: min(calc(100% - 32px), 500px);
        padding: 42px;
        border: 1px solid rgba(20, 35, 29, .1);
        border-radius: 26px;
        background: rgba(255, 255, 255, .82);
        box-shadow: 0 28px 90px rgba(21, 54, 41, .1);
        backdrop-filter: blur(18px);
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 42px;
      }
      .mark {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        color: white;
        background: #14231d;
        font-size: 13px;
        font-weight: 750;
        letter-spacing: -.04em;
      }
      .brand-copy strong {
        display: block;
        font-size: 14px;
        letter-spacing: -.02em;
      }
      .brand-copy span {
        display: block;
        margin-top: 2px;
        color: #75847d;
        font-size: 10px;
        letter-spacing: .09em;
        text-transform: uppercase;
      }
      .eyebrow {
        margin: 0 0 12px;
        color: #08765a;
        font-size: 10px;
        font-weight: 750;
        letter-spacing: .16em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0;
        font-size: clamp(30px, 8vw, 44px);
        font-weight: 650;
        letter-spacing: -.055em;
        line-height: 1.05;
      }
      .description {
        margin: 16px 0 30px;
        color: #66766e;
        font-size: 14px;
        line-height: 1.7;
      }
      .status {
        display: flex;
        min-height: 54px;
        align-items: center;
        gap: 14px;
        padding: 0 17px;
        border: 1px solid rgba(20, 35, 29, .09);
        border-radius: 15px;
        color: #31433b;
        background: rgba(239, 247, 243, .9);
        font-size: 12px;
        font-weight: 620;
      }
      .spinner {
        width: 18px;
        height: 18px;
        flex: 0 0 auto;
        border: 2px solid rgba(8, 118, 90, .18);
        border-top-color: #08765a;
        border-radius: 50%;
        animation: spin .75s linear infinite;
      }
      .dots::after {
        display: inline-block;
        width: 1.6em;
        content: "";
        animation: dots 1.4s steps(4, end) infinite;
      }
      .steps {
        display: grid;
        margin-top: 30px;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .step {
        height: 3px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(20, 35, 29, .08);
      }
      .step::after {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        content: "";
        background: #0f9f78;
        transform: translateX(-105%);
        animation: progress 2.4s ease-in-out infinite;
      }
      .step:nth-child(2)::after { animation-delay: .28s; }
      .step:nth-child(3)::after { animation-delay: .56s; }
      .fallback {
        margin: 24px 0 0;
        color: #87958e;
        font-size: 10px;
        line-height: 1.6;
        text-align: center;
      }
      .fallback a { color: #08765a; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes dots {
        0% { content: ""; }
        25% { content: "."; }
        50% { content: ".."; }
        75%, 100% { content: "..."; }
      }
      @keyframes progress {
        0% { transform: translateX(-105%); }
        45%, 70% { transform: translateX(0); }
        100% { transform: translateX(105%); }
      }
      @media (max-width: 520px) {
        main { padding: 30px 24px; border-radius: 22px; }
        .brand { margin-bottom: 34px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .spinner, .dots::after, .step::after { animation-duration: 4s; }
      }
    </style>
  </head>
  <body>
    <div class="grain" aria-hidden="true"></div>
    <main>
      <div class="brand" aria-label="iNon 统一账号">
        <div class="mark" aria-hidden="true">iN</div>
        <div class="brand-copy">
          <strong>iNon</strong>
          <span>One account · five places</span>
        </div>
      </div>
      <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="description">${escapeHtml(description)}</p>
      <div class="status" role="status" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        <span>${escapeHtml(copy.status)}<span class="dots" aria-hidden="true"></span></span>
      </div>
      <div class="steps" aria-hidden="true">
        <span class="step"></span>
        <span class="step"></span>
        <span class="step"></span>
      </div>
      <p class="fallback">
        页面会自动继续。若长时间没有响应，
        <a href="${destinationAttribute}">请点击此处重试</a>。
      </p>
    </main>
    <script>
      const destination = ${destinationScript};
      requestAnimationFrame(() => {
        requestAnimationFrame(() => window.location.replace(destination));
      });
    </script>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Security-Policy":
        "default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
      "Content-Type": "text/html; charset=utf-8",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
