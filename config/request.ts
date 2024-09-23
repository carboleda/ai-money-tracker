import { mutate } from "swr";

export interface Request {
  method: "POST" | "DELETE" | "PUT";
  body: string;
}

export const sendRequest =
  (requestKey: string) =>
  async (url: string, { arg }: { arg: Request }) => {
    return fetch(url, {
      method: arg.method,
      body: arg.body,
    }).then((response) => {
      mutate(
        (key) => typeof key === "string" && key.startsWith(requestKey),
        undefined,
        {
          revalidate: true,
        }
      );
      return response;
    });
  };
