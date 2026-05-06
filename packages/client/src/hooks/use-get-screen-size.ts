import { useEffect, useState } from "react";

export type ScreenSize = "mobile" | "tablet" | "desktop";

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
};

function getScreenSize(): ScreenSize {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;

  if (width < BREAKPOINTS.mobile) return "mobile";
  if (width < BREAKPOINTS.tablet) return "tablet";
  return "desktop";
}

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>(getScreenSize);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(getScreenSize());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return screenSize;
}
