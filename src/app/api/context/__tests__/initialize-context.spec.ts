import { NextRequest, NextResponse } from "next/server";
import { withUserContext } from "../initialize-context";
import { getUserId, runWithUserContext } from "../user-context";
import * as EnvModule from "@/config/env";

// Mock the Env module
jest.mock("@/config/env", () => ({
  Env: {
    isLocal: false,
  },
}));

/**
 * Utility function to create a NextRequest with reduced boilerplate
 * @param userId - Optional user ID to set in X-User-Id header
 * @param method - HTTP method (default: "GET")
 * @returns NextRequest instance
 */
function createTestRequest(userId?: string, method: string = "GET"): NextRequest {
  const headers: Record<string, string> = {};
  if (userId) {
    headers["X-User-Id"] = userId;
  }

  return new NextRequest("http://localhost:3000/api/test", {
    method,
    headers,
  });
}

describe("initialize-context - withUserContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User ID extraction and validation", () => {
    it("should extract user ID from X-User-Id header and pass to handler", async () => {
      const userId = "user-123";
      const mockHandler = jest.fn(async () =>
        NextResponse.json({ success: true })
      );

      const req = createTestRequest(userId);

      const response = await withUserContext(req, mockHandler);

      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it("should return 401 when X-User-Id header is missing", async () => {
      const mockHandler = jest.fn(async () =>
        NextResponse.json({ success: true })
      );

      const req = createTestRequest();

      const response = await withUserContext(req, mockHandler);

      expect(response.status).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();

      const errorData = await response.json();
      expect(errorData.error).toBe("Unauthorized: No valid user token found");
    });

    it("should return 401 when X-User-Id header is empty", async () => {
      const mockHandler = jest.fn(async () =>
        NextResponse.json({ success: true })
      );

      const req = createTestRequest("");

      const response = await withUserContext(req, mockHandler);

      expect(response.status).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should handle undefined user ID gracefully", async () => {
      const mockHandler = jest.fn(async () =>
        NextResponse.json({ success: true })
      );

      const req = createTestRequest();

      const response = await withUserContext(req, mockHandler);

      expect(response.status).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("User context isolation", () => {
    it("should make user ID available via getUserId within handler", async () => {
      const userId = "user-456";
      let contextUserId: string | undefined;

      const mockHandler = jest.fn(async () => {
        contextUserId = getUserId();
        return NextResponse.json({ userId: contextUserId });
      });

      const req = createTestRequest(userId);

      const response = await withUserContext(req, mockHandler);

      expect(response.status).toBe(200);
      expect(contextUserId).toBe(userId);
    });

    it("should throw error when getUserId is called outside of context", async () => {
      // Mock Env.isLocal as false to ensure error is thrown
      (EnvModule.Env as any).isLocal = false;

      expect(() => {
        getUserId();
      }).toThrow(
        "User context not initialized. Ensure route handler is wrapped with withUserContext()."
      );
    });

    it("should return default test user when Env.isLocal is true and no context exists", async () => {
      (EnvModule.Env as any).isLocal = true;

      const userId = getUserId();

      expect(userId).toBe("local-test-user");
    });
  });

  describe("Concurrent user isolation", () => {
    it("should isolate user contexts between concurrent requests", async () => {
      const results: Array<{ userId: string | undefined; order: number }> = [];

      const createHandler = (
        expectedUserId: string,
        delay: number,
        order: number
      ) => {
        return jest.fn(async () => {
          // Simulate some async work
          await new Promise((resolve) => setTimeout(resolve, delay));

          const contextUserId = getUserId();
          results.push({ userId: contextUserId, order });

          return NextResponse.json({ userId: contextUserId });
        });
      };

      // Create multiple concurrent requests with different user IDs
      const handler1 = createHandler("user-1", 100, 1);
      const handler2 = createHandler("user-2", 10, 2);
      const handler3 = createHandler("user-3", 30, 3);

      const req1 = createTestRequest("user-1");
      const req2 = createTestRequest("user-2");
      const req3 = createTestRequest("user-3");

      // Execute all requests concurrently
      const [response1, response2, response3] = await Promise.all([
        withUserContext(req1, handler1),
        withUserContext(req2, handler2),
        withUserContext(req3, handler3),
      ]);

      // Verify each request maintained its own user context
      const data1 = await response1.json();
      const data2 = await response2.json();
      const data3 = await response3.json();

      expect(data1.userId).toBe("user-1");
      expect(data2.userId).toBe("user-2");
      expect(data3.userId).toBe("user-3");

      // Verify all results have correct user IDs despite async delays
      results.forEach((result) => {
        expect(result.userId).toMatch(/^user-[123]$/);
      });
    });

    it("should maintain user context during nested async operations", async () => {
      const userId = "user-nested";
      const contexts: string[] = [];

      const mockHandler = jest.fn(async () => {
        contexts.push(getUserId() || "");

        // Simulate nested async operation
        await new Promise((resolve) => {
          setTimeout(() => {
            contexts.push(getUserId() || "");
            resolve(null);
          }, 10);
        });

        return NextResponse.json({ userId: getUserId() });
      });

      const req = createTestRequest(userId);

      await withUserContext(req, mockHandler);

      // All context accesses should return the same user ID
      expect(contexts).toEqual([userId, userId]);
    });

    it("should handle high concurrency (100 concurrent requests)", async () => {
      const concurrentCount = 100;
      const handlers = [];
      const results: Map<string, number> = new Map();

      for (let i = 0; i < concurrentCount; i++) {
        const userId = `user-${i}`;
        const handler = jest.fn(async () => {
          const contextUserId = getUserId();
          results.set(userId, (results.get(userId) ?? 0) + 1);
          return NextResponse.json({ userId: contextUserId });
        });

        const req = createTestRequest(userId);

        handlers.push(withUserContext(req, handler));
      }

      const responses = await Promise.all(handlers);

      // Verify all responses are successful
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Verify we got exactly one response per user
      expect(results.size).toBe(concurrentCount);
      results.forEach((count) => {
        expect(count).toBe(1);
      });
    });

    it("should not leak user context between sequential requests", async () => {
      const userIds: (string | undefined)[] = [];

      const handler1 = jest.fn(async () => {
        userIds.push(getUserId());
        return NextResponse.json({ userId: getUserId() });
      });

      const handler2 = jest.fn(async () => {
        userIds.push(getUserId());
        return NextResponse.json({ userId: getUserId() });
      });

      const req1 = createTestRequest("user-first");
      const req2 = createTestRequest("user-second");

      // Execute sequentially
      await withUserContext(req1, handler1);
      await withUserContext(req2, handler2);

      // Each handler should have seen its own user context
      expect(userIds).toEqual(["user-first", "user-second"]);
    });

    it("should handle mixed concurrent and sequential requests", async () => {
      const contexts: string[] = [];

      const createHandler = (userId: string, delay: number) => {
        return jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, delay));
          contexts.push(getUserId() || "");
          return NextResponse.json({ userId });
        });
      };

      const req1 = createTestRequest("concurrent-1");
      const req2 = createTestRequest("concurrent-2");
      const req3 = createTestRequest("sequential");

      // Execute first two concurrently
      await Promise.all([
        withUserContext(req1, createHandler("concurrent-1", 20)),
        withUserContext(req2, createHandler("concurrent-2", 10)),
      ]);

      // Then one sequentially
      await withUserContext(req3, createHandler("sequential", 0));

      // Verify all contexts were maintained
      expect(contexts.sort()).toEqual([
        "concurrent-1",
        "concurrent-2",
        "sequential",
      ]);
    });
  });

  describe("Handler execution", () => {
    it("should pass handler result through correctly", async () => {
      const expectedResponse = { data: "test-data", userId: "user-789" };

      const mockHandler = jest.fn(async () => {
        return NextResponse.json(expectedResponse);
      });

      const req = createTestRequest("user-789");

      const response = await withUserContext(req, mockHandler);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(expectedResponse);
    });

    it("should handle handler errors gracefully", async () => {
      const mockHandler = jest.fn(async () => {
        throw new Error("Handler error");
      });

      const req = createTestRequest("user-error");

      await expect(withUserContext(req, mockHandler)).rejects.toThrow(
        "Handler error"
      );
    });

    it("should execute handler only once", async () => {
      const mockHandler = jest.fn(async () =>
        NextResponse.json({ success: true })
      );

      const req = createTestRequest("user-once");

      await withUserContext(req, mockHandler);

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge cases", () => {
    it("should handle special characters in user ID", async () => {
      const specialUserId = "user-123!@#$%^&*()_+-=[]{}|;:,.<>?";
      let contextUserId: string | undefined;

      const mockHandler = jest.fn(async () => {
        contextUserId = getUserId();
        return NextResponse.json({ userId: contextUserId });
      });

      const req = createTestRequest(specialUserId);

      await withUserContext(req, mockHandler);

      expect(contextUserId).toBe(specialUserId);
    });

    it("should handle very long user ID", async () => {
      const longUserId = "user-" + "x".repeat(1000);
      let contextUserId: string | undefined;

      const mockHandler = jest.fn(async () => {
        contextUserId = getUserId();
        return NextResponse.json({ userId: contextUserId });
      });

      const req = createTestRequest(longUserId);

      await withUserContext(req, mockHandler);

      expect(contextUserId).toBe(longUserId);
    });

    it("should handle whitespace in user ID", async () => {
      const userIdWithSpace = "user 123";
      let contextUserId: string | undefined;

      const mockHandler = jest.fn(async () => {
        contextUserId = getUserId();
        return NextResponse.json({ userId: contextUserId });
      });

      const req = createTestRequest(userIdWithSpace);

      await withUserContext(req, mockHandler);

      expect(contextUserId).toBe(userIdWithSpace);
    });
  });

  describe("runWithUserContext integration", () => {
    it("should correctly set context via runWithUserContext", async () => {
      const userId = "test-user";
      let retrievedUserId: string | undefined;

      const callback = () => {
        retrievedUserId = getUserId();
      };

      runWithUserContext(userId, callback);

      expect(retrievedUserId).toBe(userId);
    });

    it("should support nested runWithUserContext calls with different users", async () => {
      const userIds: string[] = [];

      const outerCallback = () => {
        userIds.push(getUserId() || "");

        // Nested call - Note: This will create a new context that shadows the outer one
        runWithUserContext("nested-user", () => {
          userIds.push(getUserId() || "");
        });

        // After nested call exits, we're back in outer context
        userIds.push(getUserId() || "");
      };

      runWithUserContext("outer-user", outerCallback);

      // The outer context is restored after the nested call
      expect(userIds).toEqual(["outer-user", "nested-user", "outer-user"]);
    });
  });
});
