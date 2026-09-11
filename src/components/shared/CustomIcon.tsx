import { Avatar, AvatarRootProps, Badge } from "@heroui/react";
import { FaCheck } from "react-icons/fa";

interface CustomIconProps extends AvatarRootProps {
  icon?: string | null;
  withBadge?: boolean;
  isChecked?: boolean;
}

const renderIcon = (icon?: string | null, isChecked?: boolean) => {
  if (isChecked) {
    return (
      <div className="relative flex items-center justify-center rounded-full w-6 h-6 bg-success/20">
        <span className="absolute inset-0 rounded-full bg-success animate-check-ring" />
        <FaCheck className="relative text-sm text-success animate-check-pop" />
      </div>
    );
  }
  return <span className="text-2xl">{icon ?? "💸"}</span>;
};

export const CustomIcon: React.FC<CustomIconProps> = ({
  icon,
  withBadge = false,
  isChecked = false,
  ...avatarProps
}) => {
  const { color = "default" } = avatarProps;
  return (
    <Badge.Anchor>
      <Avatar
        className="rounded-lg"
        variant="default"
        color={color}
        {...avatarProps}
      >
        <Avatar.Fallback className="rounded-lg">
          {renderIcon(icon, isChecked)}
        </Avatar.Fallback>
      </Avatar>
      {withBadge && (
        <Badge
          color={color}
          placement="top-left"
          size="sm"
          className="min-w-3 min-h-3"
        />
      )}
    </Badge.Anchor>
  );
};
