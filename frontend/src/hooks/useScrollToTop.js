import { useEffect } from "react";

/** Scroll window to top when dependencies change (e.g. route params). */
export function useScrollToTop(...dependencies) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, dependencies);
}
