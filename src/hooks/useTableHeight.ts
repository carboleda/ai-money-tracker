import { useEffect, useState } from "react";

const FALLBACK_HEIGHT_PX = 300;

export const useTableHeight = () => {
  const [maxTableHeight, setMaxTableHeight] = useState(FALLBACK_HEIGHT_PX);

  useEffect(() => {
    const updateTableHeight = () => {
      const availableHeight = window.innerHeight - 170;
      setMaxTableHeight(
        availableHeight > 0 ? availableHeight : FALLBACK_HEIGHT_PX
      );
    };

    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);

    return () => {
      window.removeEventListener("resize", updateTableHeight);
    };
  }, []);

  return { maxTableHeight };
};
