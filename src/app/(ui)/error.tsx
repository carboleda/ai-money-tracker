"use client";

import { useEffect } from "react";
import { Button } from "@heroui/button";
import { Code } from "@heroui/code";

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
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong!
        </h2>
        <h3 className="text-lg text-gray-700 mb-4">{error.message}</h3>
        <Code color="danger" className="text-wrap mb-4">
          <p className="text-wrap">{error.stack}</p>
        </Code>
        <Button
          variant="solid"
          color="primary"
          onPress={() => reset()}
          className="w-full"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
