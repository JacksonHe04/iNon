import { redirect } from "next/navigation";
import { getInonProjectSso } from "@/lib/sso/project-client";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  redirect(getInonProjectSso().loginUrl(params.next));
}
