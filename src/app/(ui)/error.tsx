"use client";

import { useEffect } from "react";
import { Button } from "@heroui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <h3>{error.message}</h3>
      <p>{error.stack}</p>
      <Button
        variant="solid"
        color="primary"
        onPress={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
