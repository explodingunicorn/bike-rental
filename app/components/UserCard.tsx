import {
  Badge,
  Button,
  Flex,
  Heading,
  IconButton,
  Stack,
} from "@chakra-ui/react";
import { FC } from "react";
import { FaTrash } from "react-icons/fa";
import { User } from "~/types/user";
import { Card } from "./Card";

export interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  editing?: boolean;
  deleting?: boolean;
}

export const UserCard: FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  editing,
  deleting,
}) => {
  return (
    <Card>
      <Stack dir="column" spacing={4} alignItems="start">
        <Badge colorScheme={user.manager ? "teal" : "gray"}>
          {user.manager ? "Manager" : "User"}
        </Badge>
        <Flex
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          style={{ width: "100%" }}
        >
          <Heading as="p" size="md">
            {user.email}
          </Heading>
          <IconButton
            colorScheme="red"
            variant="ghost"
            onClick={() => onDelete(user)}
            icon={<FaTrash />}
            aria-label="delete"
            isLoading={deleting}
          />
        </Flex>

        <Button
          colorScheme="blue"
          isLoading={editing}
          onClick={() => onEdit(user)}
          isFullWidth
        >
          Edit
        </Button>
      </Stack>
    </Card>
  );
};
