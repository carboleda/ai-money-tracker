import { Button, ButtonProps, Spinner } from "@heroui/react";

export const LoadingButton: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <Button isPending {...rest}>
      {({ isPending }) => (
        <>
          {isPending ? <Spinner color="current" size="sm" /> : null}
          {children}
        </>
      )}
    </Button>
  );
};
