import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "remix";
import { supabase } from "~/api";
import { BikeCard } from "~/components/BikeCard";
import { BikeFilter, useBikeFilter } from "~/components/BikeFilter";
import { Bike } from "~/types/bike";
import { Reservation } from "~/types/reservation";
import { buildBikeFilterQuery } from "~/utils/buildBikeFilterQuery";
import { setApiAuth } from "~/utils/setApiAuth";

export const loader: LoaderFunction = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const startDate =
    searchParams.get("startDate") || new Date().toISOString().substring(0, 10);
  const endDate =
    searchParams.get("endDate") || new Date().toISOString().substring(0, 10);
  await setApiAuth(request);
  const { data: reservations } = await supabase
    .from<Reservation>("reservations")
    .select()
    .or(
      `and(end.gte.${startDate},start.lte.${startDate}),and(start.lte.${endDate},end.gte.${endDate}),and(end.lte.${endDate},start.gte.${startDate})`
    );
  const bikeIds = reservations?.map((reservation) => reservation.bike_id) ?? [];
  let bikes;
  if (bikeIds.length) {
    const bikeQuery = buildBikeFilterQuery(searchParams);
    const { error, data: bikesAvailable } = await bikeQuery.not(
      "id",
      "in",
      `(${bikeIds.join(",")})`
    );
    bikes = bikesAvailable;
  } else {
    const { data: bikesAvailable } = await supabase
      .from<Bike>("bikes")
      .select();
    bikes = bikesAvailable;
  }
  return json({ bikes, startDate });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await setApiAuth(request);
  const form = await request.formData();
  const start = form.get("startDate") as string;
  const end = form.get("endDate") as string;
  const bike_id = form.get("id") as string;
  const user_id = session.user?.id;
  if (start && end && bike_id && user_id) {
    const { error, data } = await supabase
      .from<Reservation>("reservations")
      .insert({
        start: new Date(start),
        end: new Date(end),
        bike_id: Number(bike_id),
        user_id,
      });
    if (error) {
      return json({ error: "Could not insert bike" });
    }
    return { reserved: data };
  }
  return json({ error: "Wrong params" });
};

export default function Bikes() {
  const loaderData = useLoaderData<{ bikes?: Bike[]; startDate: string }>();
  const [bikeFilter, setBikeFilter, overrideBikeFilter] = useBikeFilter();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [searchParams] = useSearchParams();
  const minDate = loaderData.startDate;
  const submit = useSubmit();
  const [bikeToReserve, setBikeToReserve] = useState<Bike | null>();
  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(minDate);

  useEffect(() => {
    const queryStartDate = searchParams.get("startDate");
    if (queryStartDate) {
      setStartDate(queryStartDate);
    }
    const queryEndDate = searchParams.get("endDate");
    if (queryEndDate) {
      setEndDate(queryEndDate);
    }
    overrideBikeFilter({
      model: (searchParams.get("model") as BikeFilter["model"]) || "All",
      color: (searchParams.get("color") as BikeFilter["color"]) || "All",
      rating: (searchParams.get("rating") as BikeFilter["rating"]) || "All",
      city: (searchParams.get("city") as BikeFilter["city"]) || "",
      state: (searchParams.get("state") as BikeFilter["state"]) || "",
    });
  }, [searchParams]);

  useEffect(() => {
    if (bikeToReserve) {
      onOpen();
    } else {
      onClose();
    }
  }, [bikeToReserve]);

  const onReserve = (bike: Bike) => {
    setBikeToReserve(bike);
  };

  const confirmReservation = () => {
    if (bikeToReserve) {
      submit(
        { startDate, endDate, id: bikeToReserve.id.toString() },
        { method: "post" }
      );
      setBikeToReserve(null);
    }
  };

  return (
    <>
      <VStack spacing="4" alignItems={"flex-start"}>
        <Heading as="h1">Rent a bike</Heading>
        <Flex
          dir="row"
          paddingBlock={4}
          as="form"
          alignItems={"flex-end"}
          gap="4"
          method="get"
          onSubmit={(e) => {
            e.preventDefault();
            submit(
              {
                startDate,
                endDate,
                color: bikeFilter.color,
                model: bikeFilter.model,
                rating: bikeFilter.rating?.toString() || "No rating",
                city: bikeFilter.city,
                state: bikeFilter.state,
              },
              { method: "get" }
            );
          }}
        >
          <Flex gap="4">
            <FormControl>
              <FormLabel>Start date</FormLabel>
              <Input
                type="date"
                min={minDate}
                max={endDate}
                name="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>End date</FormLabel>
              <Input
                type="date"
                min={startDate}
                name="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormControl>
          </Flex>
          <Button
            type="submit"
            colorScheme="green"
            name="submit"
            disabled={!startDate || !endDate}
          >
            Find bikes
          </Button>
        </Flex>
        <BikeFilter
          {...bikeFilter}
          onChange={setBikeFilter}
          loading={false}
          onSubmit={() => {}}
        />
        <Grid
          templateColumns={"repeat(3, 1fr)"}
          gap="4"
          gridAutoRows="minmax(min-content, max-content)"
        >
          {loaderData.bikes &&
            loaderData.bikes.length > 0 &&
            loaderData.bikes.map((bike) => (
              <GridItem key={bike.id}>
                <BikeCard bike={bike} onReserve={onReserve} />
              </GridItem>
            ))}
          {loaderData.bikes?.length === 0 && (
            <GridItem colSpan={3}>
              <Heading as="p" size="lg" color="gray.600">
                No bikes available at this time.
              </Heading>
            </GridItem>
          )}
        </Grid>
      </VStack>
      <Modal onClose={onClose} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm reservation</ModalHeader>
          {bikeToReserve && (
            <ModalBody>
              You are reserving a {bikeToReserve.color} {bikeToReserve.model} in{" "}
              {bikeToReserve.city}, {bikeToReserve.state}
            </ModalBody>
          )}
          <ModalFooter dir="row" justifyContent="end" gap="4">
            <Button
              colorScheme="gray"
              variant="ghost"
              onClick={() => setBikeToReserve(null)}
            >
              Cancel
            </Button>
            <Button colorScheme="green" onClick={confirmReservation}>
              Reserve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}