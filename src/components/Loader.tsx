"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SPLASH_KEY = "splash-shown-v1";
const TOTAL_MS = 3000;

export default function Loader() {
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const onKoe = pathname?.startsWith("/koe") ?? false;

  useEffect(() => {
    // LIFFフォーム(/koe)では起動スプラッシュを出さない
    if (onKoe) return;
    if (sessionStorage.getItem(SPLASH_KEY)) {
      setHidden(true);
      return;
    }
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, "1");
      setHidden(true);
      document.body.style.overflow = "";
    }, TOTAL_MS);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [onKoe]);

  if (hidden || onKoe) return null;

  return (
    <div className="splash" aria-hidden>
      <div className="splash-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="splash-oneosaka" src="/logos/oneosaka.png" alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="splash-ishin" src="/logos/ishin-horizontal.png" alt="" />
        <div className="splash-name">村田ひろき</div>
      </div>
    </div>
  );
}
