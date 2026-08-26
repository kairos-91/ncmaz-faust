import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { icon: FacebookIcon, href: "#", label: "Facebook", className: "text-blue-500 hover:text-blue-400" },
  { icon: InstagramIcon, href: "#", label: "Instagram", className: "text-pink-500 hover:text-pink-400" },
  { icon: TikTokIcon, href: "#", label: "TikTok", className: "text-red-500 hover:text-red-400" },
];

export function SiteFooter() {
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

          <div className="mt-1 flex items-center gap-4">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label, className }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={className}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-900">
        <p className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-neutral-500 sm:px-6">
          © {new Date().getFullYear()} - Desarrollado por{" "}
          <Link href="/" className="hover:text-neutral-300">
            ALT Agencia de Marketing
          </Link>
        </p>
      </div>
    </footer>
  );
}
