import { QueryClient } from "@tanstack/react-query";

export interface MutationRequest {
  method: "POST" | "DELETE" | "PUT";
  body: string | FormData;
}

export const fetchJson = <T>(url: string): Promise<T> =>
  fetch(url).then((res) => res.json());

export const sendRequest = (url: string, request: MutationRequest) =>
  fetch(url, {
    method: request.method,
    body: request.body,
  });

export const invalidateResource = (
  queryClient: QueryClient,
  resource: string
) =>
  queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === resource,
  });
