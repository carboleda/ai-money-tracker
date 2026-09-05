import { useCallback } from "react";
import { CustomDateRangePicker, RangeList } from "../../CustomDateRangePicker";
import { getMonthBounds } from "@/config/utils";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { Label, RangeValue } from "@heroui/react";
import { useZolventFilterContext } from "../ZolventFilter";

export const DateRangeFilter: React.FC = () => {
  const { t, draftFilters, setDraftFilters } = useZolventFilterContext();
  const currentMonthBounds = getMonthBounds(new Date());
  const selectedKey =
    (draftFilters.dateRangeKey as RangeList) || RangeList.this;
  const dateWithin: RangeValue<ZonedDateTime> = {
    start: parseAbsoluteToLocal(
      draftFilters.startDate || currentMonthBounds.start.toISOString(),
    ),
    end: parseAbsoluteToLocal(
      draftFilters.endDate || currentMonthBounds.end.toISOString(),
    ),
  };

  const onChange = useCallback(
    (value: RangeValue<ZonedDateTime>) => {
      setDraftFilters({
        startDate: value.start.toDate().toISOString(),
        endDate: value.end.toDate().toISOString(),
      });
    },
    [setDraftFilters],
  );

  const onSelectedKeyChange = useCallback(
    (key: RangeList) => {
      setDraftFilters({ dateRangeKey: key });
    },
    [setDraftFilters],
  );

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-semibold">{t("dateRangeFilter")}</Label>
      <CustomDateRangePicker
        granularity="day"
        className="w-full"
        isRequired
        value={dateWithin}
        onChange={onChange}
        selectedKey={selectedKey}
        onSelectedKeyChange={onSelectedKeyChange}
      />
    </div>
  );
};
