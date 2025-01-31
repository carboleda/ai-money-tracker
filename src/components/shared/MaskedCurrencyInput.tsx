import { Input } from "@heroui/input";
import { NumericFormat, NumericFormatProps } from "react-number-format";

export const MaskedCurrencyInput: React.FC<NumericFormatProps<any>> = (
  props
) => (
  <NumericFormat
    thousandSeparator={true}
    decimalSeparator="."
    decimalScale={2}
    fixedDecimalScale={false}
    prefix="$"
    customInput={Input}
    {...props}
  />
);
