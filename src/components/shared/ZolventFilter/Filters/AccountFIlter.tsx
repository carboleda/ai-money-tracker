import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { useZolventFilterContext } from "../ZolventFilter";
import { Label } from "@heroui/react";

export const AccountFilter: React.FC = () => {
  const { t, draftFilters, setDraftFilters } = useZolventFilterContext();
  const value = draftFilters.account ?? "";

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-semibold">{t("bankAccount")}</Label>
      <BankAccounDropdown
        label=""
        value={value}
        onChange={(key) => setDraftFilters({ account: key ?? "" })}
      />
    </div>
  );
};
