import { useAuth } from "@/providers/AuthProvider";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import Messages from "@/components/Messages";

export default function () {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const users_key = [user.id, params.chat_user_id].sort().join(":");

  useEffect(() => {
    getMessages();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(users_key)
      .on(
        "postgres_changes",
        {
          event: "INSERT", // can be '*' if we want to listen to UPDATE, DELETE, etc. (but for now insert is good)
          schema: "public",
          table: "Chat",
          filter: `users_key=eq.${users_key}`,
        },
        (payload) => {
          console.log(payload);
          // setMessages((messages) => [...messages, payload]); // this would be the right way to do it, but user doesn't exist on chat table
          getMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // clean up listener
    };
  }, [messages, setMessages, users_key]);

  const getMessages = async () => {
    const { data, error } = await supabase
      .from("Chat")
      .select("*, User(username, id)")
      .eq("users_key", users_key);
    if (error) return console.log(error);
    setMessages(data);
  };

  const addMessage = async (text: string) => {
    const { error } = await supabase.from("Chat").insert({
      user_id: user.id,
      chat_user_id: params.chat_user_id,
      text,
      users_key,
    });
    if (error) return console.log(error);
    getMessages(); // if successful, re-fetch messages
  };

  return <Messages messages={messages} addMessage={addMessage} />;
}
