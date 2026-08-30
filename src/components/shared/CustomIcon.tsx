import { Avatar, AvatarRootProps } from "@heroui/react";

interface CustomIconProps extends AvatarRootProps {
  icon?: string | null;
}

export const CustomIcon: React.FC<CustomIconProps> = ({
  icon,
  ...avatarProps
}) => {
  return (
    <Avatar
      className="rounded-lg"
      variant="default"
      color="default"
      {...avatarProps}
    >
      <Avatar.Fallback className="rounded-lg">
        <span className="text-2xl">{icon ?? "💸"}</span>
      </Avatar.Fallback>
    </Avatar>
  );
};
