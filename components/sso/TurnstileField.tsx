"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

interface TurnstileApi {
  remove(widgetId: string): void;
  render(
    container: HTMLElement,
    options: {
      action: string;
      callback(token: string): void;
      "error-callback"(): void;
      "expired-callback"(): void;
      sitekey: string;
      size: "flexible";
      theme: "auto";
    },
  ): string;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileFieldProps {
  action: string;
  onToken(token: string | null): void;
  siteKey: string;
}

export function TurnstileField({
  action,
  onToken,
  siteKey,
}: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onToken);
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile),
  );

  useEffect(() => {
    callbackRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!scriptReady || !window.turnstile || !containerRef.current) {
      return;
    }
    callbackRef.current(null);
    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      theme: "auto",
      size: "flexible",
      callback: (token) => callbackRef.current(token),
      "expired-callback": () => callbackRef.current(null),
      "error-callback": () => callbackRef.current(null),
    });
    const turnstile = window.turnstile;
    return () => {
      turnstile.remove(widgetId);
    };
  }, [action, scriptReady, siteKey]);

  if (!siteKey) {
    return (
      <p className="sso-challenge-error">
        安全验证尚未配置，请稍后再试。
      </p>
    );
  }

  return (
    <div className="sso-challenge">
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
    </div>
  );
}
