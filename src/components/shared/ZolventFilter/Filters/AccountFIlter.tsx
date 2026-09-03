import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { useZolventFilterContext } from "../ZolventFilter";

export const AccountFilter: React.FC = () => {
  const { t, draftFilters, setDraftFilters } = useZolventFilterContext();
  const value = draftFilters.account ?? "";

  return (
    <BankAccounDropdown
      label={t("accountFilter")}
      value={value}
      onChange={(key) => setDraftFilters({ account: key ?? "" })}
    />
  );
};
