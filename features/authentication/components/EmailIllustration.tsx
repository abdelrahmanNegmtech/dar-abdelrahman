export function EmailIllustration() {
  return (
    <div className="mx-auto flex h-[160px] w-[210px] items-center justify-center">
      <svg
        aria-hidden="true"
        className="h-full w-full"
        fill="none"
        viewBox="0 0 230 175"
      >
        <circle cx="44" cy="38" r="13" fill="#ECE8FF" />
        <circle cx="191" cy="41" r="14" fill="#ECE8FF" />
        <circle cx="25" cy="136" r="5" fill="#DED6FF" />
        <circle cx="213" cy="140" r="6" fill="#DED6FF" />
        <path
          d="M71 34 115 6l44 28v58H71V34Z"
          fill="url(#paperBack)"
        />
        <rect
          height="82"
          rx="10"
          width="112"
          x="59"
          y="38"
          fill="#F4F1FF"
        />
        <rect height="8" rx="4" width="64" x="82" y="58" fill="#A996EA" />
        <rect height="7" rx="3.5" width="88" x="82" y="78" fill="#D7D0F4" />
        <rect height="7" rx="3.5" width="76" x="82" y="97" fill="#D7D0F4" />
        <path
          d="M42 77c0-6.6 5.4-12 12-12h122c6.6 0 12 5.4 12 12v69c0 6.6-5.4 12-12 12H54c-6.6 0-12-5.4-12-12V77Z"
          fill="url(#envelope)"
        />
        <path
          d="m43 76 72 55 72-55"
          stroke="#8C72DF"
          strokeWidth="2"
        />
        <path
          d="m43 151 55-45"
          stroke="#9C84E8"
          strokeWidth="2"
        />
        <path
          d="m187 151-55-45"
          stroke="#9C84E8"
          strokeWidth="2"
        />
        <circle cx="174" cy="88" r="32" fill="url(#badge)" />
        <path
          d="m158 88 10 10 22-23"
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7"
        />
        <defs>
          <linearGradient id="paperBack" x1="71" x2="159" y1="6" y2="92">
            <stop stopColor="#9B80EF" />
            <stop offset="1" stopColor="#6B43D7" />
          </linearGradient>
          <linearGradient id="envelope" x1="42" x2="188" y1="65" y2="158">
            <stop stopColor="#BBAAF2" />
            <stop offset="1" stopColor="#8B72DE" />
          </linearGradient>
          <linearGradient id="badge" x1="142" x2="206" y1="56" y2="120">
            <stop stopColor="#6C3DFF" />
            <stop offset="1" stopColor="#4424BD" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
