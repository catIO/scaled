import { useEffect } from "react";

const DARK_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cg fill='%23ffffff'%3E%3Crect x='80' y='300' width='88' height='176' rx='14'/%3E%3Crect x='212' y='168' width='88' height='308' rx='14'/%3E%3Crect x='344' y='36' width='88' height='440' rx='14'/%3E%3C/g%3E%3C/svg%3E";

const LIGHT_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cg fill='%23000000'%3E%3Crect x='80' y='300' width='88' height='176' rx='14'/%3E%3Crect x='212' y='168' width='88' height='308' rx='14'/%3E%3Crect x='344' y='36' width='88' height='440' rx='14'/%3E%3C/g%3E%3C/svg%3E";

export function useDynamicFavicon() {
  useEffect(() => {
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");

    const updateFavicon = () => {
      let link = document.getElementById("favicon") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.id = "favicon";
        link.rel = "icon";
        link.type = "image/svg+xml";
        document.head.appendChild(link);
      }
      link.href = matcher.matches ? DARK_ICON : LIGHT_ICON;
    };

    updateFavicon();

    try {
      matcher.addEventListener("change", updateFavicon);
      return () => matcher.removeEventListener("change", updateFavicon);
    } catch {
      try {
        matcher.addListener(updateFavicon);
        return () => matcher.removeListener(updateFavicon);
      } catch {
        // Fallback for older browsers
      }
    }
  }, []);
}
