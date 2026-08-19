"use client";

import { useEffect } from "react";
import { Button } from "@heroui/react";

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
        <code className="block text-wrap mb-4 rounded-md bg-danger/10 p-3 text-sm text-danger">
          <p className="text-wrap">{error.stack}</p>
        </code>
        <Button variant="primary" onPress={() => reset()} className="w-full">
          Try again
        </Button>
      </div>
    </div>
  );
}
