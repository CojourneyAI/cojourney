import { Edit } from "react-feather"
import React from "react"
import { ActionIcon, Flex, Tooltip } from "@mantine/core"
import useGlobalStore, {
  type IDatabaseMessage
} from "../../../../../store/useGlobalStore"

interface IMessageFunctions {
  handleEdit: () => void
  message: IDatabaseMessage
}
const MessageFunctions = ({
  handleEdit,
  message
}: IMessageFunctions): JSX.Element => {
  const {
    user: { uid }
  } = useGlobalStore()

  return (
    <Flex gap={5}>
      {message.user_id === uid && (
        <Tooltip
          withArrow
          withinPortal
          label="Edit"
        >
          <ActionIcon onClick={handleEdit}>
            <Edit size={14} />
          </ActionIcon>
        </Tooltip>
      )}
    </Flex>
  )
}

export default MessageFunctions
