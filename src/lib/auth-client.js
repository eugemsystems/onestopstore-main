import { useSession } from "next-auth/react";

const getUserSession = () => {
  const { data } = useSession();

  const userInfo = data?.user || null;
  return userInfo;
};

export { getUserSession };
