import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { getT } from "@/lib/i18n/locale";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "@/components/social-links";

const ICON_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white";

const SOCIAL_LINKS = [
  { icon: FacebookIcon, href: "#", label: "Facebook" },
  { icon: InstagramIcon, href: "#", label: "Instagram" },
  { icon: TiktokIcon, href: "#", label: "TikTok" },
];

export async function SiteFooter() {
  const { t } = await getT();

  return (
    <footer className="bg-neutral-950 text-neutral-400">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            src="/logo-dark.png"
            alt="Levery"
            width={135}
            height={54}
            className="h-9 w-auto"
          />

          <a
            href="mailto:soporte@levery.app"
            className="flex items-center gap-2 text-sm font-medium text-lime-400 hover:text-lime-300"
          >
            <Mail className="h-4 w-4" />
            soporte@levery.app
          </a>

          <div className="mt-1 flex items-center gap-2">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={ICON_BUTTON_CLASS}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-900">
        <p className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-neutral-500 sm:px-6">
          © {new Date().getFullYear()} - {t.footer.developedBy}{" "}
          <Link href="/" className="hover:text-neutral-300">
            ALT Agencia de Marketing
          </Link>
        </p>
      </div>
    </footer>
  );
}
