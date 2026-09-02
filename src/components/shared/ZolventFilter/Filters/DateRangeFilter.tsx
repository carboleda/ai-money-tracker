import { useState } from "react";
import { CustomDateRangePicker } from "../../CustomDateRangePicker";
import { getMonthBounds } from "@/config/utils";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { RangeValue } from "@heroui/react";
import { useZolventFilterContext } from "../ZolventFilter";

export const DateRangeFilter: React.FC = () => {
  const { t, activeFilterValues } = useZolventFilterContext();
  const currentMonthBounds = getMonthBounds(new Date());
  const [dateWithin, setDateWithin] = useState<RangeValue<ZonedDateTime>>({
    start: parseAbsoluteToLocal(
      activeFilterValues["startDate"] || currentMonthBounds.start.toISOString(),
    ),
    end: parseAbsoluteToLocal(
      activeFilterValues["endDate"] || currentMonthBounds.end.toISOString(),
    ),
  });
  const dateWithinStart = dateWithin.start.toDate().toISOString();
  const dateWithinEnd = dateWithin.end.toDate().toISOString();

  return (
    <>
      <input type="hidden" name="startDate" value={dateWithinStart} />
      <input type="hidden" name="endDate" value={dateWithinEnd} />
      <CustomDateRangePicker
        label={t("dateRangeFilter")}
        granularity="day"
        className="w-full"
        isRequired
        value={dateWithin}
        onChange={setDateWithin}
      />
    </>
  );
};
