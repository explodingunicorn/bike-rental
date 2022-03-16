import { Avatar } from "@chakra-ui/react";
import { FC } from "react";
import { FaBicycle } from "react-icons/fa";

export const BikeAvatar: FC<{ color: string }> = ({ color }) => {
  return (
    <Avatar
      bg={color.toLowerCase()}
      icon={<FaBicycle fontSize={"1.25rem"} />}
      color="white"
      size="sm"
    />
  );
};
