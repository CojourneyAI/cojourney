import { useParams } from "react-router-dom"
import React from "react"
import useGlobalStore from "../../../store/useGlobalStore"
import LoadingRoomData from "./LoadingRoomData/LoadingRoomData"
import Room from "./Room"
import RoomNotFound from "./RoomNotFound/RoomNotFound"
import useRoomData from "../../../Hooks/rooms/useRoomData"

const RoomIndex = (): JSX.Element => {
  const { roomId } = useParams()
  const { getRoomData } = useRoomData({ roomId })

  const {
    currentRoom: { isLoading, roomNotFound }
  } = useGlobalStore()

  if (isLoading) return <LoadingRoomData />
  if (roomNotFound) return <RoomNotFound />

  if (!roomId) return <p>Error: roomId not found</p>

  return (
    <Room
      roomId={roomId}
      getRoomData={getRoomData}
    />
  )
}

export default RoomIndex
