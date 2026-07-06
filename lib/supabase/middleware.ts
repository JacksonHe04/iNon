import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkIsAdmin, checkUserOwnsIdentifier, getUserDashboardPath } from '@/lib/auth/access'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  const userEmail = typeof data?.claims?.email === 'string' ? data.claims.email : undefined
  const isAuthenticated = Boolean(userId)
  const pathname = request.nextUrl.pathname
  // 需要登录才能访问的页面：后台管理 /admin/* 和个人管理页 /i/*
  const isProtectedPage =
    pathname.startsWith('/admin') || pathname === '/i' || pathname.startsWith('/i/')
  const isAdminApi = pathname.startsWith('/api/admin')
  const isAccountApi = pathname === '/api/account' || pathname.startsWith('/api/account/')

  if (!isAuthenticated && (isProtectedPage || isAccountApi)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    loginUrl.searchParams.set('next', pathname)

    if (isAccountApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.redirect(loginUrl)
  }

  if (!isAuthenticated && isAdminApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (isAuthenticated && userId && pathname.startsWith('/admin')) {
    const isAdmin = await checkIsAdmin(userId, userEmail)
    if (!isAdmin) {
      const dashboardPath = (await getUserDashboardPath(userId)) ?? '/'
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = dashboardPath
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl)
    }
  }

  if (isAuthenticated && userId && pathname.startsWith('/i/')) {
    const identifier = pathname.slice('/i/'.length).split('/')[0]
    if (identifier) {
      const ownsPage = await checkUserOwnsIdentifier(userId, identifier)
      if (!ownsPage) {
        const dashboardPath = (await getUserDashboardPath(userId)) ?? '/login'
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = dashboardPath
        redirectUrl.search = ''
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  if (isAuthenticated && userId && isAdminApi) {
    const isAdmin = await checkIsAdmin(userId, userEmail)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
