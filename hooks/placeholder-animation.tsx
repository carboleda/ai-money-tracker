"use client";

import { useEffect, useState } from "react";

export const usePlaceholderAnimation = (placeholders: string[]) => {
  const [index, setIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    let place = "";
    const typingInterval = setInterval(() => {
      if (place.length < placeholders[index].length) {
        place += placeholders[index][place.length];
        setPlaceholder(place);
      } else {
        clearInterval(typingInterval);
        const deletingInterval = setInterval(() => {
          if (place.length > 0) {
            place = place.slice(0, place.length - 1);
            setPlaceholder(place);
          } else {
            clearInterval(deletingInterval);
            setIndex((index + 1) % placeholders.length);
          }
        }, 100);
      }
    }, 100);
    return () => clearInterval(typingInterval);
  }, [index, placeholders]);

  return [placeholder];
};
