import { useAuth } from "@/providers/AuthProvider";
import Profile from "@/components/Profile";

export default function () {
  const { user, signOut, following, followers } = useAuth();

  return <Profile user={user} following={following} followers={followers} />;
}
