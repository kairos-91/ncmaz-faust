import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50 md:flex-row">
      <AdminNav email={user.email ?? null} />
      <main className="flex-1 px-4 py-8 md:px-10">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
