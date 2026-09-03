import { useZolventFilterContext } from "../ZolventFilter";
import { CloseButton, InputGroup, TextField } from "@heroui/react";
import { HiOutlineSearch } from "react-icons/hi";

interface FreeTextFilterProps {
  applyOnChange?: boolean;
}

export const FreeTextFilter: React.FC<FreeTextFilterProps> = ({
  applyOnChange = false,
}) => {
  const {
    t,
    draftFilters,
    setDraftFilters,
    appliedFilters,
    setImmediateFilters,
  } = useZolventFilterContext();
  const value = applyOnChange
    ? (appliedFilters.freeText ?? "")
    : (draftFilters.freeText ?? "");
  const setFilter = applyOnChange ? setImmediateFilters : setDraftFilters;

  const onValueChange = (value: string = "") => {
    setFilter({ freeText: value });
  };

  const onClear = () => {
    setFilter({ freeText: "" });
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
