import { ReactNode } from "react";
import { Avatar, AvatarRootProps, Badge } from "@heroui/react";
import { FaCheck } from "react-icons/fa";

interface CustomIconProps extends AvatarRootProps {
  icon?: string | null;
  withBadge?: boolean;
  badgeIcon?: ReactNode;
  badgeColor?: Required<AvatarRootProps>["color"];
  isChecked?: boolean;
}

const renderIcon = (icon?: string | null, isChecked?: boolean) => {
  if (isChecked) {
    return (
      <div className="relative flex items-center justify-center rounded-full w-6 h-6 bg-current/20">
        <span className="absolute inset-0 rounded-full bg-current animate-check-ring" />
        <FaCheck className="relative text-sm text-current animate-check-pop" />
      </div>
    );
  }
  return <span className="text-2xl">{icon ?? "💸"}</span>;
};

export const CustomIcon: React.FC<CustomIconProps> = ({
  icon,
  withBadge = false,
  badgeIcon,
  badgeColor,
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
      {(withBadge || badgeIcon) && (
        <Badge
          color={badgeColor ?? color}
          placement="top-left"
          size="sm"
          className="min-w-3 min-h-3"
        >
          {badgeIcon}
        </Badge>
      )}
    </Badge.Anchor>
  );
};
