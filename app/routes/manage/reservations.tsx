import { Box, Grid, Heading, Select, Stack } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";
import {
  json,
  LoaderFunction,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "remix";
import { supabase } from "~/api";
import { setApiAuth } from "~/utils/setApiAuth";
import { Reservation } from "~/types/reservation";
import { User } from "~/types/user";
import { Bike } from "~/types/bike";
import { Card } from "~/components/Card";
import { ReservationCard } from "~/components/ReservationCard";

type UserReservations = User & { reservations: Reservation[] };
type BikeReservations = Bike & { reservations: Reservation[] };

export const loader: LoaderFunction = async ({ request }) => {
  await setApiAuth(request);
  const searchParams = new URL(request.url).searchParams;
  const type = searchParams.get("type") as string;
  if (type === "bikes") {
    const { error, data } = await supabase
      .from<BikeReservations>("bikes")
      .select("*, reservations(*)");
    return json({ error, reservations: data });
  } else {
    const { error, data } = await supabase
      .from<UserReservations>("user_permissions")
      .select("*, reservations (*, bikes(*))");
    return json({ error, reservations: data });
  }
};

export default function ManageReservations() {
  const submit = useSubmit();
  const loaderData =
    useLoaderData<{ reservations?: (UserReservations & BikeReservations)[] }>();
  const [searchParams] = useSearchParams();
  const [reservationSelection, setReservationSelection] = useState("users");

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setReservationSelection(e.target.value);
    submit({ type: e.target.value });
  };

  useEffect(() => {
    const type = searchParams.get("type") || "users";
    setReservationSelection(type);
  }, [searchParams]);

  return (
    <Stack direction="column" spacing="6">
      <Heading as="h1">Reservations</Heading>
      <Box>
        <Select value={reservationSelection} onChange={onSelectChange}>
          <option value="users">By users</option>
          <option value="bikes">By bikes</option>
        </Select>
      </Box>
      <Heading as="h2" size="lg">
        {reservationSelection === "users"
          ? "User reservations"
          : "Bike reservations"}
      </Heading>
      <Grid templateColumns="repeat(1, 1fr)" gap="6">
        {loaderData.reservations?.map((userOrBike) => {
          return (
            <Card key={userOrBike.id}>
              <Stack dir="column" spacing="6">
                <Heading as="p" size="sm">
                  {userOrBike.model
                    ? `${userOrBike.color} ${userOrBike.model}`
                    : userOrBike.email}
                </Heading>
                {userOrBike.reservations.length ? (
                  <Grid templateColumns="repeat(3, 1fr)" gap="6">
                    {userOrBike.reservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={{ bikes: userOrBike, ...reservation }}
                        display
                      />
                    ))}
                  </Grid>
                ) : (
                  <Heading color="gray.600" as="p" size="sm">
                    No reservations
                  </Heading>
                )}
              </Stack>
            </Card>
          );
        })}
      </Grid>
    </Stack>
  );
}
