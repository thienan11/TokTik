import { useAuth } from "@/providers/AuthProvider";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import Messages from "@/components/Messages";

export default function () {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    getComments();
  }, []);

  const getComments = async () => {
    const { data, error } = await supabase
      .from("Comment")
      .select("*, User(username, id)")
      .eq("video_id", params.video_id);
    if (error) return console.log(error);
    setComments(data);
  };

  const addComment = async (text: string) => {
    const { error } = await supabase.from("Comment").insert({
      user_id: user.id,
      video_id: params.video_id,
      text,
      video_user_id: params.video_user_id,
    });
    if (error) return console.log(error);
    getComments(); // if successful, re-fetch comments
  };

  return <Messages messages={comments} addMessage={addComment} />;
}
