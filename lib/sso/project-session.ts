import type { InonProjectSession } from "@inon-ai/inon-sso";
import { InonSsoError } from "@inon-ai/inon-sso";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getInonProjectSso } from "./project-client";

export async function currentInonRequest(): Promise<Request> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie");
  return new Request(
    process.env.INON_SSO_PUBLIC_ORIGIN ?? "https://inon.space",
    cookie ? { headers: { cookie } } : {},
  );
}

export async function getInonProjectSession(): Promise<InonProjectSession | null> {
  return getInonProjectSso().getSession(await currentInonRequest());
}

export async function getInonProjectAdminSession(): Promise<InonProjectSession | null> {
  try {
    return await getInonProjectSso().requireProjectAdmin(
      await currentInonRequest(),
    );
  } catch (error) {
    if (
      error instanceof InonSsoError &&
      (error.code === "UNAUTHENTICATED" ||
        error.code === "REFRESH_REQUIRED" ||
        error.code === "FORBIDDEN")
    ) {
      return null;
    }
    throw error;
  }
}

export async function requireInonProjectUser(
  returnTo: string,
): Promise<InonProjectSession> {
  try {
    return await getInonProjectSso().requireUser(
      await currentInonRequest(),
    );
  } catch (error) {
    if (
      error instanceof InonSsoError &&
      error.code === "UNAUTHENTICATED"
    ) {
      redirect(getInonProjectSso().loginUrl(returnTo));
    }
    throw error;
  }
}

export async function requireInonProjectAdmin(
  returnTo: string,
): Promise<InonProjectSession> {
  try {
    return await getInonProjectSso().requireProjectAdmin(
      await currentInonRequest(),
    );
  } catch (error) {
    if (error instanceof InonSsoError) {
      if (error.code === "UNAUTHENTICATED") {
        redirect(getInonProjectSso().loginUrl(returnTo));
      }
      if (error.code === "REFRESH_REQUIRED") {
        redirect(getInonProjectSso().refreshUrl(returnTo));
      }
      if (error.code === "FORBIDDEN") {
        redirect("/");
      }
    }
    throw error;
  }
}
