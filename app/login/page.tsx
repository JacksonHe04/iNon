import LoginClient from './LoginClient';

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next || '/';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(220,252,231,0.8),_rgba(240,253,250,0.9))] px-4">
      <LoginClient nextPath={nextPath} />
    </div>
  );
}
