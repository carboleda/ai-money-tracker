import { useZolventFilterContext } from "../ZolventFilter";
import { CloseButton, InputGroup, TextField } from "@heroui/react";
import { HiOutlineSearch } from "react-icons/hi";

export const FreeTextFilter: React.FC = () => {
  const { t, draftFilters, setDraftFilters } = useZolventFilterContext();
  const value = draftFilters.freeText ?? "";

  const onValueChange = (value: string = "") => {
    setDraftFilters({ freeText: value });
  };

  const onClear = () => {
    setDraftFilters({ freeText: "" });
  };

  return (
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
  );
};
