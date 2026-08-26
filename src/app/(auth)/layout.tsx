import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/">
          <Logo height={30} />
        </Link>
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {children}
      </div>
    </div>
  );
}
