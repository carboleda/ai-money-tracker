import { HasId } from "@/interfaces/global";
import { Selection } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";

interface UseTableSelectionProps<T extends HasId> {
  items: T[] | undefined;
  isMutating: boolean;
}

export const useTableSelection = <T extends HasId>({
  items,
  isMutating,
}: UseTableSelectionProps<T>) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [selectedItem, setSelectedItem] = useState<T>();

  const clearSelection = useCallback(() => {
    setSelectedItem(undefined);
    setSelectedKeys(new Set());
  }, []);

  const onSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedKeys(keys);
      setSelectedItem(items?.find((item) => item.id === [...keys][0]));
    },
    [items],
  );

  useEffect(() => {
    clearSelection();
  }, [isMutating, items, clearSelection]);

  return {
    selectedKeys,
    setSelectedKeys,
    selectedItem,
    setSelectedItem,
    onSelectionChange,
    clearSelection,
  };
};
