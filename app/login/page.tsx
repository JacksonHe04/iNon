import { redirect } from "next/navigation";
import { inonLoginPath } from "@/lib/sso/public-paths";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  redirect(inonLoginPath(params.next ?? "/"));
}
