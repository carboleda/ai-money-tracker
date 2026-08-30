import { Input, Label, TextField } from "@heroui/react";
import { NumericFormat, NumericFormatProps } from "react-number-format";

interface MaskedCurrencyInputProps extends NumericFormatProps<any> {
  label?: string;
  isRequired?: boolean;
}

export const MaskedCurrencyInput: React.FC<MaskedCurrencyInputProps> = ({
  label,
  isRequired,
  ...props
}) => (
  <TextField isRequired={isRequired}>
    {label && <Label>{label}</Label>}
    <NumericFormat
      thousandSeparator={true}
      decimalSeparator="."
      decimalScale={2}
      fixedDecimalScale={false}
      prefix="$"
      customInput={Input}
      {...props}
    />
  </TextField>
);
