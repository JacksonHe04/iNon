import { InonSsoError } from "@inon/sso-next";
import { NextResponse, type NextRequest } from "next/server";
import {
  checkUserOwnsIdentifier,
  getUserDashboardPath,
} from "@/lib/auth/access";
import { getInonProjectSso } from "@/lib/sso/project-client";

function requestReturnTo(request: NextRequest): string {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

function projectRedirect(
  request: NextRequest,
  path: string,
): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPage = pathname.startsWith("/admin");
  const isOwnerPage =
    pathname === "/i" || pathname.startsWith("/i/");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAccountApi =
    pathname === "/api/account" ||
    pathname.startsWith("/api/account/");
  const requiresSession =
    isAdminPage || isOwnerPage || isAdminApi || isAccountApi;

  if (!requiresSession) {
    return NextResponse.next({ request });
  }

  const sso = getInonProjectSso();
  const session = await sso.getSession(request);
  if (!session) {
    if (isAdminApi || isAccountApi) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    return projectRedirect(
      request,
      sso.loginUrl(requestReturnTo(request)),
    );
  }

  if (isAdminPage || isAdminApi) {
    try {
      await sso.requireProjectAdmin(request);
    } catch (error) {
      if (
        error instanceof InonSsoError &&
        error.code === "REFRESH_REQUIRED"
      ) {
        const refreshUrl = sso.refreshUrl(requestReturnTo(request));
        if (isAdminApi) {
          return NextResponse.json(
            { error: "Session refresh required", refreshUrl },
            { status: 401 },
          );
        }
        return projectRedirect(request, refreshUrl);
      }
      if (isAdminApi) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 },
        );
      }
      return projectRedirect(
        request,
        (await getUserDashboardPath(session.id)) ?? "/",
      );
    }
  }

  if (pathname.startsWith("/i/")) {
    const identifier = pathname.slice("/i/".length).split("/")[0];
    if (
      identifier &&
      !(await checkUserOwnsIdentifier(session.id, identifier))
    ) {
      return projectRedirect(
        request,
        (await getUserDashboardPath(session.id)) ?? "/i",
      );
    }
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
