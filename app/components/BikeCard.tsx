import {
  Avatar,
  Button,
  Flex,
  Grid,
  Heading,
  IconButton,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react";
import { FaBicycle, FaBiking, FaTrashAlt } from "react-icons/fa";
import { FC, useEffect } from "react";
import { Bike } from "~/types/bike";
import { Card } from "./Card";
import { BikeAvatar } from "./BikeAvatar";

export interface BikeCardProps {
  bike: Bike;
  manage?: boolean;
  onEdit?: (bike: Bike) => void;
  onDelete?: (bike: Bike) => void;
  onReserve?: (bike: Bike) => void;
  deleting?: boolean;
  editing?: boolean;
  reserving?: boolean;
}

export const BikeCard: FC<BikeCardProps> = ({
  bike,
  manage,
  onEdit,
  onDelete,
  onReserve,
  deleting,
  editing,
}) => {
  return (
    <Card>
      <Stack dir="column" spacing="8" flex="1">
        <Flex dir="row" alignItems={"center"} gap="2">
          <BikeAvatar color={bike.color} />
          <Heading as="p" size="md">
            {bike.color} {bike.model}
          </Heading>
          <Flex flex="1" justifyContent={"end"}>
            {manage && (
              <IconButton
                colorScheme={"red"}
                variant="ghost"
                icon={<FaTrashAlt />}
                aria-label="Delete"
                onClick={() => onDelete?.(bike)}
                isLoading={deleting}
                disabled={editing}
              />
            )}
          </Flex>
        </Flex>
        <Grid templateColumns={"repeat(2, 1fr)"} gap="6" marginTop="4">
          <Stat>
            <StatLabel>Location</StatLabel>
            <StatNumber>
              {bike.city}, {bike.state}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Rating</StatLabel>
            <StatNumber>
              {bike.rating ? `${bike.rating}/5` : "No rating"}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Can rent</StatLabel>
            <StatNumber color={bike.can_rent ? "green" : "red"}>
              {bike.can_rent ? "Yes" : "No"}
            </StatNumber>
          </Stat>
        </Grid>
        <Flex flex="1" alignItems="end">
          {!manage && (
            <Button colorScheme="green" onClick={() => onReserve?.(bike)}>
              Reserve
            </Button>
          )}
          {manage && (
            <Button
              colorScheme="blue"
              onClick={() => onEdit?.(bike)}
              disabled={deleting}
              isLoading={editing}
              isFullWidth
            >
              Edit
            </Button>
          )}
        </Flex>
      </Stack>
    </Card>
  );
};
