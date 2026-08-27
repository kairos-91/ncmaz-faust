function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <defs>
        <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285aeb" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" fill="url(#ig-gradient)" />
      <rect
        x="6.5"
        y="6.5"
        width="11"
        height="11"
        rx="3.2"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3.1" fill="none" stroke="white" strokeWidth="1.6" />
      <circle cx="15.6" cy="8.4" r="0.9" fill="white" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <rect width="24" height="24" fill="#010101" />
      <path
        d="M15.6 3.5c.4 2 1.9 3.4 3.9 3.6v2.7c-1.4 0-2.7-.4-3.9-1.2v6.1c0 3-2.4 5.3-5.4 5.3S4.8 17.7 4.8 14.7c0-2.9 2.3-5.2 5.2-5.3v2.8c-1.3.1-2.4 1.2-2.4 2.5 0 1.4 1.1 2.5 2.5 2.5 1.4 0 2.6-1.1 2.6-2.5V3.5h2.9Z"
        fill="#ee1d52"
      />
      <path
        d="M15 3.2c.4 2 1.9 3.4 3.9 3.6v2.7c-1.4 0-2.7-.4-3.9-1.2v6.1c0 3-2.4 5.3-5.4 5.3S4.2 17.4 4.2 14.4c0-2.9 2.3-5.2 5.2-5.3v2.8c-1.3.1-2.4 1.2-2.4 2.5 0 1.4 1.1 2.5 2.5 2.5 1.4 0 2.6-1.1 2.6-2.5V3.2h2.9Z"
        fill="#25f4ee"
        opacity="0.75"
      />
      <path
        d="M15.3 3.35c.4 2 1.9 3.4 3.9 3.6v2.7c-1.4 0-2.7-.4-3.9-1.2v6.1c0 3-2.4 5.3-5.4 5.3s-5.4-2.3-5.4-5.3c0-2.9 2.3-5.2 5.2-5.3v2.8c-1.3.1-2.4 1.2-2.4 2.5 0 1.4 1.1 2.5 2.5 2.5 1.4 0 2.6-1.1 2.6-2.5V3.35h2.9Z"
        fill="white"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <rect width="24" height="24" fill="#1877f2" />
      <path
        d="M13.5 20v-6.44h2.16l.32-2.5h-2.48V9.4c0-.72.2-1.22 1.24-1.22h1.32V5.94c-.23-.03-1.02-.1-1.93-.1-1.9 0-3.21 1.16-3.21 3.3v1.85H8.75v2.5h2.17V20h2.58Z"
        fill="white"
      />
    </svg>
  );
}

const ICON_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full shadow-sm ring-1 ring-black/5 transition-transform hover:scale-105";

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
