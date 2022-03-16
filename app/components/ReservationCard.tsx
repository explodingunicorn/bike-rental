import {
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { FC } from "react";
import { Bike } from "~/types/bike";
import { Reservation } from "~/types/reservation";
import { BikeAvatar } from "./BikeAvatar";
import { Card } from "./Card";

export interface ReservationCardProps {
  reservation: Reservation & { bikes: Bike };
  onCancel?: (reservation: ReservationCardProps["reservation"]) => void;
  cancelling?: boolean;
  onRate?: (reservation: ReservationCardProps["reservation"]) => void;
  rating?: boolean;
  display?: boolean;
}

export const ReservationCard: FC<ReservationCardProps> = ({
  reservation,
  onCancel,
  cancelling,
  onRate,
  rating,
  display,
}) => {
  return (
    <Card>
      <Stack dir="column" spacing="4">
        <Flex dir="row" alignItems={"center"} gap="2">
          <BikeAvatar color={reservation.bikes.color} />
          <Heading as="p" size="md">
            {reservation.bikes.color} {reservation.bikes.model}
          </Heading>
        </Flex>
        <Stat>
          <StatLabel>Reservation</StatLabel>
          <StatNumber>
            {reservation.start} - {reservation.end}
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Location</StatLabel>
          <StatNumber>
            {reservation.bikes.city}, {reservation.bikes.state}
          </StatNumber>
        </Stat>
        {!display && (
          <>
            <Button
              colorScheme="blue"
              disabled={!onRate}
              isLoading={rating}
              onClick={() => onRate?.(reservation)}
            >
              {onRate ? "Rate" : "Rated"}
            </Button>
            <Button
              colorScheme="red"
              variant="ghost"
              isFullWidth
              isLoading={cancelling}
              onClick={() => onCancel?.(reservation)}
            >
              Cancel reservation
            </Button>
          </>
        )}
      </Stack>
    </Card>
  );
};
