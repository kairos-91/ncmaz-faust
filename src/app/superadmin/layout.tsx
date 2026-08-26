import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperadmin } from "@/lib/superadmin";
import { SuperadminNav } from "./superadmin-nav";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isSuperadmin(user.email)) redirect("/admin");

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50 dark:bg-neutral-950 md:flex-row">
      <SuperadminNav email={user.email ?? null} />
      <main className="flex-1 px-4 py-8 md:px-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
