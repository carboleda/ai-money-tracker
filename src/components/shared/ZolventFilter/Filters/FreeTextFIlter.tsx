import { useZolventFilterContext } from "../ZolventFilter";
import {
  CloseButton,
  InputGroup,
  TextField,
  TextFieldRootProps,
} from "@heroui/react";
import { HiOutlineSearch } from "react-icons/hi";

interface FreeTextFilterProps extends TextFieldRootProps {
  applyOnChange?: boolean;
  inputGroupClassName?: string;
}

export const FreeTextFilter: React.FC<FreeTextFilterProps> = ({
  applyOnChange = false,
  inputGroupClassName,
  ...rest
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
    <TextField
      className="w-full"
      value={value}
      onChange={onValueChange}
      {...rest}
    >
      <InputGroup variant="secondary" className={inputGroupClassName}>
        <InputGroup.Prefix>
          <HiOutlineSearch className="text-lg" />
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
