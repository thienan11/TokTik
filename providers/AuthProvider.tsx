import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";

export const AuthContext = createContext({
  user: null, // state we need to have access to in all pages to authenticte current user
  signIn: async (email: string, password: string) => {},
  signUp: async (username: string, email: string, password: string) => {},
  signOut: async () => {},
  likes: [],
  getLikes: async (userId: string) => {},
  following: [],
  getFollowing: async (userId: string) => {},
  followers: [],
  getFollowers: async (userId: string) => {},
  friends: [],
  getFriends: async () => {},
  avatarUrl: "",
  fetchUserAvatar: async (userId: string) => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [likes, setLikes] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    getFriends();
  }, [following, followers]);

  const getFriends = async () => {
    const followingIds = following.map((f) => f.follower_user_id); // ppl we are following
    const followerIds = followers.map((f) => f.user_id); // ppl following us
    const duplicates = followingIds.filter((id) => followerIds.includes(id));

    console.log("friends:", duplicates);
    setFriends(duplicates);
  };

  const getLikes = async (userId: string) => {
    // console.log("userId", userId);
    if (!userId) return;
    const { data, error } = await supabase
      .from("Like")
      .select("*")
      .eq("user_id", userId);
    setLikes(data);
    console.log("Likes:", data);
  };

  const getFollowing = async (userId: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("Follower")
      .select("*")
      .eq("user_id", userId);
    if (!error) setFollowing(data);
    console.log("Following:", data);
  };

  const getFollowers = async (userId: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("Follower")
      .select("*, User(*)")
      .eq("follower_user_id", userId);
    if (!error) setFollowers(data);
    console.log("Followers:", data);
  };

  const fetchUserAvatar = async (userId: string) => {
    if (!userId) return;

    try {
      // List all files in the user's avatar directory
      const { data, error } = await supabase.storage
        .from("avatars")
        .list(`${userId}`);

      if (error) throw error;

      if (data && data.length > 0) {
        // Find files that start with "avatar."
        const avatarFiles = data.filter((file) =>
          file.name.startsWith("avatar.")
        );

        if (avatarFiles.length > 0) {
          // Sort by created_at or last_modified if available (newest first)
          avatarFiles.sort(
            (a, b) =>
              new Date(b.created_at || b.last_modified || 0).getTime() -
              new Date(a.created_at || a.last_modified || 0).getTime()
          );

          // Get the latest avatar file
          const latestAvatar = avatarFiles[0];

          // Create a public URL for the avatar
          // const { data: publicUrlData } = supabase.storage
          //   .from("avatars")
          //   .getPublicUrl(`${userId}/${latestAvatar.name}`);

          // setAvatarUrl(publicUrlData.publicUrl);
          const publicAvatarUrl = `${process.env.EXPO_PUBLIC_BUCKET}/avatars/${userId}/${latestAvatar.name}`;
          setAvatarUrl(publicAvatarUrl);
          // return publicUrlData.publicUrl;
          // return publicAvatarUrl;
          return;
        }
      }

      // If no avatar found, return null or a default
      setAvatarUrl("");
      // return "";
    } catch (error) {
      console.error("Error fetching avatar:", error);
      setAvatarUrl("");
      // return "";
    }
  };

  const getUser = async (id: string) => {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("id", id)
      .single(); // find in User table any user that has the input id (get one item aka an object)
    if (error) return console.error(error);

    setUser(data); // if successful, set the user from the data
    // console.log(data);
    getLikes(data.id);
    getFollowing(data.id);
    getFollowers(data.id);
    fetchUserAvatar(data.id);
    router.push("/(tabs)");
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) return console.error(error);
    getUser(data.user.id);
  };

  const signUp = async (username: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) return console.error(error);

    // If successful, create a user in the User table
    const { error: userError } = await supabase.from("User").insert({
      id: data?.user?.id, // use the user object that we get back from auth ('data' data object) as primary key in User table
      username: username,
      email: email,
    });
    if (userError) return console.error(userError);
    getUser(data?.user?.id);
    router.back(); // dismiss signup modal first before redirecting to home
    router.push("/(tabs)");
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return console.error(error);
    setUser(null); // reset current user
    router.push("/(auth)");
  };

  // Runs when AuthProvider mounts, get user id from session token (if exists) and call getUser(), redirecting you to home
  useEffect(() => {
    const { data: authData } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) return router.push("/(auth)"); // go to auth page if session expired

        getUser(session?.user?.id);
      }
    );

    return () => {
      authData.subscription.unsubscribe(); // cleanup the subscription on unmount
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        likes,
        getLikes,
        following,
        getFollowing,
        followers,
        getFollowers,
        friends,
        getFriends,
        avatarUrl,
        fetchUserAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
