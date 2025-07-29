import { useEffect, useState } from "react";

export const useTableHeight = () => {
  const [maxTableHeight, setMaxTableHeight] = useState(300);

  useEffect(() => {
    const updateTableHeight = () => {
      const availableHeight = window.innerHeight - 220; // Adjust 220px as needed for margins, headers, etc.
      setMaxTableHeight(availableHeight > 0 ? availableHeight : 300);
    };

    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);

    return () => {
      window.removeEventListener("resize", updateTableHeight);
    };
  }, []);

  return { maxTableHeight };
};
