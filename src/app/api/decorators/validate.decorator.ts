import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export function Validate(schema: z.ZodSchema) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: NextRequest) {
      try {
        const body = await req.json();
        const validatedData = schema.parse(body);

        // Attach validated data to request for use in handler
        (req as any).validatedBody = validatedData;

        return originalMethod.call(this, req);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            {
              error: "Validation failed",
              details: error.issues,
            },
            { status: 400 }
          );
        }
        throw error;
      }
    };

    return descriptor;
  };
}
