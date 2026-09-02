import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { useState } from "react";
import { useZolventFilterContext } from "../ZolventFilter";

export const AccountFilter: React.FC = () => {
  const { t, activeFilterValues } = useZolventFilterContext();
  const [value, setValue] = useState<string>(
    activeFilterValues["account"] ?? "",
  );

  return (
    <>
      <input
        type="hidden"
        name="account"
        value={value}
        onChange={(e) => setValue(e.target.value ?? "")}
      />
      <BankAccounDropdown
        label={t("accountFilter")}
        value={value}
        onChange={(key) => setValue(key ?? "")}
      />
    </>
  );
};
