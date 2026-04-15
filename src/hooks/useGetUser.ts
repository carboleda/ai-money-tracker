import useSWR from "swr";
import { User } from "@/interfaces/user";

const KEY = "/api/user";

interface GetUserResponse {
  user: User;
}

export const useGetUser = () => {
  const { data, error, isLoading } = useSWR<GetUserResponse>(KEY);

  return {
    user: data?.user ?? null,
    error,
    isLoading,
  };
};
