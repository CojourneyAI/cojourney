import React, { useEffect, useState } from "react";
import {
  AgentRuntime,
  onMessage,
  agentActions,
  getGoals,
  createGoal,
  getRelationship,
} from "@cojourney/agent";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useGlobalStore from "../../../../store/useGlobalStore";

const agentId = "00000000-0000-0000-0000-000000000000";
const userName = "User"; // TODO: get from user profile
const agentName = "CJ";
const debugMode = false;

const defaultGoal = {
  name: "First Time User Experience",
  description: "CJ wants to get to know the user.",
  status: "IN_PROGRESS", // other types are "DONE" and "FAILED"
  objectives: [
    {
      description: "Determine if it is the user's first time",
      condition:
        "User indicates that it is their first time or that they are new",
      completed: false,
    },
    {
      description:
        "Get the user to enable their microphone by pressing the microphone button",
      condition: "User calls microphone_enabled action",
      completed: false,
    },
    {
      description: "Learn details about the user's interests and personality",
      condition:
        "User tells CJ a few key facts about about their interests and personality",
      completed: false,
    },
    {
      description:
        "CJ updates the user's profile with the information she has learned",
      condition: "CJ calls update_profile action",
      completed: false,
    },
    {
      description:
        "Connect the user to someone from the rolodex who they might like to chat with",
      condition: "CJ calls INTRODUCE action",
      completed: false,
    },
  ],
};

interface Props {
  roomData: any;
  setInputHandler: any;
}

const AgentBinding = ({ roomData, setInputHandler }: Props) => {
  const [agentRuntime, setAgentRuntime] = useState<AgentRuntime | null>(null);
  const supabase = useSupabaseClient();
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [lastRoomId, setLastRoomId] = useState("");
  const {
    currentRoom: { messages, roomParticipants },
    user: { uid },
  } = useGlobalStore();

  const userId = uid as string;

  useEffect(() => {
    if (!supabase || !userId) return;
        // if roomData ID same as lastRoomId
    // and messages length is same as lastMessageCount, return
    if (
      roomData?.id === lastRoomId &&
      messages?.length === lastMessageCount
    ) {
      return;
    }
    setLastRoomId(roomData?.id);
    setLastMessageCount(messages?.length || 0);
    
    async function startAgent(): Promise<void> {
      if(agentRuntime) return;
      const { data: { session } } = await supabase.auth.getSession() as any;
      const runtime = new AgentRuntime({
        debugMode,
        supabase,
        token: session.access_token,
        serverUrl: import.meta.env.VITE_SERVER_URL,
      });
      setAgentRuntime(runtime);

      // get the room_id where user_id is user_a and agent_id is user_b OR vice versa
      const data = await getRelationship({
        supabase,
        userA: userId,
        userB: agentId,
      })

      // TODO, just get the room id from channel
      const room_id = data?.room_id;

      const goals = await getGoals({
        supabase: runtime.supabase,
        userIds: [userId, agentId],
      });

      if (goals.length === 0) {
        await createGoal({
          supabase: runtime.supabase,
          userIds: [userId, agentId],
          userId: agentId,
          goal: defaultGoal,
        });
      }

      runtime.registerMessageHandler(
        async ({ agentName: _agentName, content, action }: any) => {
          console.log(
              `${_agentName}: ${content}${action ? ` (${action})` : ""}`,
          );
        },
      );

      agentActions.forEach((action) => {
        // console.log('action', action)
        runtime.registerActionHandler(action);
      });

      if (runtime.debugMode) {
        console.log(
            `Actions registered: ${runtime
              .getActions()
              .map((a) => a.name)
              .join(", ")}`,
        );
      }

      // Function to simulate agent's response
      setInputHandler({
        send: async (content: any) => {
          console.log('onMessage handling')
        await onMessage(
          {
            name: userName,
            content,
            senderId: userId,
            agentId,
            eventType: "message",
            userIds: [userId, agentId],
            agentName,
            data,
            room_id,
          },
          runtime,
        );
      }
    });
      return undefined;
    }
    startAgent();
  }, [supabase, userId]);

  useEffect(() => {
    console.log("roomData changed", roomData);
  }, [roomData]);

  return <></>
};

export default AgentBinding;
