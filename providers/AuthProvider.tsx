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
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [likes, setLikes] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
