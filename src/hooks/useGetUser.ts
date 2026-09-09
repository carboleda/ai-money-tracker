import { useQuery } from "@tanstack/react-query";
import { User } from "@/interfaces/user";
import { fetchJson } from "@/config/request";

const KEY = "/api/user";

interface UserProfile {
  name?: string;
  email?: string;
  picture?: string;
}

interface GetUserResponse {
  user: User;
  profile: UserProfile;
}

export const useGetUser = () => {
  const { data, error, isLoading } = useQuery<GetUserResponse>({
    queryKey: [KEY],
    queryFn: () => fetchJson<GetUserResponse>(KEY),
  });

  return {
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    error,
    isLoading,
  };
};
