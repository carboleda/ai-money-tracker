import { Chip } from "@heroui/react";

interface ValidationErrorChipProps {
  message: string;
}

export const ValidationErrorChip: React.FC<ValidationErrorChipProps> = ({
  message,
}) => {
  if (!message) return null;

  return (
    <Chip
      variant="soft"
      color="danger"
      className="text-wrap max-w-full w-full h-fit p-2 rounded-sm"
    >
      {message}
    </Chip>
  );
};
