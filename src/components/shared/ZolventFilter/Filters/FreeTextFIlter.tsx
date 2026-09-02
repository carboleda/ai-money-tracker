import { useState } from "react";
import { useZolventFilterContext } from "../ZolventFilter";
import { CloseButton, InputGroup, TextField } from "@heroui/react";
import { HiOutlineSearch } from "react-icons/hi";

export const FreeTextFilter: React.FC = () => {
  const { t, activeFilterValues } = useZolventFilterContext();
  const [value, setValue] = useState<string>(
    activeFilterValues["freeText"] ?? "",
  );

  const onValueChange = (value: string = "") => {
    setValue(value);
  };

  const onClear = () => {
    setValue("");
  };

  return (
    <>
      <input type="hidden" name="freeText" value={value} />
      <TextField className="w-full" value={value} onChange={onValueChange}>
        <InputGroup variant="secondary">
          <InputGroup.Prefix>
            <HiOutlineSearch />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder={t("searchByDescription")} />
          {value && (
            <InputGroup.Suffix>
              <CloseButton aria-label={t("clear")} onPress={onClear} />
            </InputGroup.Suffix>
          )}
        </InputGroup>
      </TextField>
    </>
  );
};
