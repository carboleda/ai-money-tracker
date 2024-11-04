import { useState } from "react";

type Value = boolean | number | string | Function;

export const useLocalStorage = (key: string, initialValue: Value) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === "undefined") {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log("useLocalStorage", error);
      return initialValue;
    }
  });

  const setValue = (value: Value) => {
    try {
      if (typeof window === "undefined") {
        return;
      }

      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log("useLocalStorage", error);
    }
  };
  return [storedValue, setValue];
};
