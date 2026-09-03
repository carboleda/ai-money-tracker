import { Avatar, AvatarRootProps, Badge } from "@heroui/react";

interface CustomIconProps extends AvatarRootProps {
  icon?: string | null;
  withBadge?: boolean;
}

export const CustomIcon: React.FC<CustomIconProps> = ({
  icon,
  withBadge = false,
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
          <span className="text-2xl">{icon ?? "💸"}</span>
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
