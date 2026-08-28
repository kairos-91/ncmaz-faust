export function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[18px] w-[18px]"
      {...props}
    >
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 0 1 1.77 1.15 4.9 4.9 0 0 1 1.15 1.77c.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C1.81 15.58 1.8 15.2 1.8 12s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43a4.9 4.9 0 0 1 1.15-1.77A4.9 4.9 0 0 1 5.19 1.8c.46-.16 1.26-.35 2.43-.4C8.89 1.34 9.27 1.33 12 1.33Zm0 1.8c-3.14 0-3.51.01-4.75.07-1.02.04-1.58.21-1.95.35-.49.19-.84.42-1.2.79-.37.36-.6.71-.79 1.2-.14.37-.31.93-.35 1.95C2.9 9.4 2.9 9.77 2.9 12.9c0 3.14 0 3.51.06 4.75.04 1.02.21 1.58.35 1.95.19.49.42.84.79 1.2.36.37.71.6 1.2.79.37.14.93.31 1.95.35 1.24.06 1.61.07 4.75.07s3.51-.01 4.75-.07c1.02-.04 1.58-.21 1.95-.35a3.1 3.1 0 0 0 1.2-.79c.37-.36.6-.71.79-1.2.14-.37.31-.93.35-1.95.06-1.24.07-1.61.07-4.75s-.01-3.51-.07-4.75c-.04-1.02-.21-1.58-.35-1.95a3.1 3.1 0 0 0-.79-1.2 3.1 3.1 0 0 0-1.2-.79c-.37-.14-.93-.31-1.95-.35-1.24-.06-1.61-.07-4.75-.07Zm0 4.6a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8Zm0 1.8a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm5.6-2a1.26 1.26 0 1 1 0 2.52 1.26 1.26 0 0 1 0-2.52Z" />
    </svg>
  );
}

export function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[18px] w-[18px]"
      {...props}
    >
      <path d="M16.6 1.5h-3.2v14.2a2.9 2.9 0 1 1-2.06-2.78V9.6a6.1 6.1 0 1 0 5.26 6.05V8.9a7.9 7.9 0 0 0 4.6 1.48V7.1a4.7 4.7 0 0 1-4.6-4.62V1.5Z" />
    </svg>
  );
}

export function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[18px] w-[18px]"
      {...props}
    >
      <path d="M13.5 22v-8.44h2.83l.42-3.29h-3.25V8.19c0-.95.26-1.6 1.63-1.6h1.74V3.66c-.3-.04-1.33-.13-2.53-.13-2.5 0-4.22 1.53-4.22 4.34v2.4H7.28v3.3h2.84V22h3.38Z" />
    </svg>
  );
}

const ICON_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800";

export function SocialLinks({
  instagramUrl,
  tiktokUrl,
  facebookUrl,
}: {
  instagramUrl: string | null;
  tiktokUrl: string | null;
  facebookUrl: string | null;
}) {
  if (!instagramUrl && !tiktokUrl && !facebookUrl) return null;

  return (
    <div className="mb-1 flex items-center gap-1.5">
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className={ICON_BUTTON_CLASS}
        >
          <InstagramIcon />
        </a>
      )}
      {tiktokUrl && (
        <a
          href={tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className={ICON_BUTTON_CLASS}
        >
          <TiktokIcon />
        </a>
      )}
      {facebookUrl && (
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className={ICON_BUTTON_CLASS}
        >
          <FacebookIcon />
        </a>
      )}
    </div>
  );
}
