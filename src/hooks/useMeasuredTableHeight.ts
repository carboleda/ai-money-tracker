import { useCallback, useEffect, useState } from "react";

const BOTTOM_SPACING_PX = 16;
const FALLBACK_HEIGHT_PX = 300;

/**
 * Measures the space between the container's own top (i.e. everything
 * rendered above it, which varies per page) and the viewport bottom, so the
 * table's scroll area fills exactly what's left without pushing the page
 * itself into a second, outer scrollbar.
 *
 * The container only mounts once loading finishes, so a plain `useRef`
 * never sees it attach - `containerRef` here is a callback ref instead,
 * which fires (and re-triggers the measurement) the moment the node mounts.
 */
export const useMeasuredTableHeight = () => {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [maxTableHeight, setMaxTableHeight] = useState(FALLBACK_HEIGHT_PX);

  const containerRef = useCallback((el: HTMLElement | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node) return;

    const updateTableHeight = () => {
      const { top } = node.getBoundingClientRect();
      const availableHeight = window.innerHeight - top - BOTTOM_SPACING_PX;
      setMaxTableHeight(
        availableHeight > 0 ? availableHeight : FALLBACK_HEIGHT_PX,
      );
    };

    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);

    return () => {
      window.removeEventListener("resize", updateTableHeight);
    };
  }, [node]);

  return { maxTableHeight, containerRef };
};
