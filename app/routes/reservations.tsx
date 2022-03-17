import {
  ActionFunction,
  json,
  LoaderFunction,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "remix";
import { supabase } from "~/api";
import {
  Button,
  Grid,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ReservationCard,
  ReservationCardProps,
} from "~/components/ReservationCard";
import { Reservation } from "~/types/reservation";
import { setApiAuth } from "~/utils/setApiAuth";
import { FormEvent, useState } from "react";
import { Review } from "~/types/review";
import { GeneralError } from "~/components/GeneralError";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await setApiAuth(request);
  if (session.user?.id) {
    const { error, data: reservations } = await supabase
      .from<ReservationCardProps["reservation"]>("reservations")
      .select("*, bikes (model, color, city, state)")
      .eq("user_id", session.user.id as string);
    const { error: ratingError, data: reviews } = await supabase
      .from<Review>("reviews")
      .select()
      .eq("user_id", session.user.id);
    if (!!error || !!ratingError) {
      return json({ error: "Something went wrong" });
    }
    return json({ reservations, reviews });
  }
  return json({ error: "Something went wrong" });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await setApiAuth(request);
  const method = request.method;
  const form = await request.formData();
  const id = form.get("id") as string;
  const review = form.get("review") as string;
  if (method === "DELETE" && id) {
    const { error, data } = await supabase
      .from<Reservation>("reservations")
      .delete()
      .eq("id", id);
    if (error) {
      return json({ error: "Something went wrong deleting this reservation" });
    }
    return null;
  }
  if (method === "POST" && id && review) {
    const { data } = await supabase
      .from<Review>("reviews")
      .select()
      .eq("bike_id", id)
      .eq("user_id", session.user?.id || "");
    if (data?.length === 0 && session.user?.id) {
      const { error, data } = await supabase.from<Review>("reviews").insert({
        rating: Number(review),
        bike_id: Number(id),
        user_id: session.user.id,
      });
      if (error) {
        return json({ error: "Could not insert rating" });
      }
      return json({ ratings: data });
    }

    return null;
  }
  return json({ error: "Something went wrong" });
};

export default function Reservations() {
  const { onClose, onOpen, isOpen } = useDisclosure();
  const [selectedReservation, setSelectedReservation] = useState<
    ReservationCardProps["reservation"] | null
  >(null);
  const [review, setReview] = useState("3");
  const submit = useSubmit();
  const loaderData = useLoaderData<{
    reservations?: ReservationCardProps["reservation"][];
    reviews?: Review[];
    error?: string;
  }>();
  const actionData = useActionData<{ error?: string }>();
  const transition = useTransition();

  const onReservationCancel = (
    reservation: ReservationCardProps["reservation"]
  ) => {
    submit({ id: reservation.id.toString() }, { method: "delete" });
  };

  const onRatingClicked = (
    reservation: ReservationCardProps["reservation"]
  ) => {
    setSelectedReservation(reservation);
    onOpen();
  };

  const onRating = (e: FormEvent) => {
    e.preventDefault();
    if (selectedReservation) {
      submit(
        { id: selectedReservation.bike_id.toString(), review },
        { method: "post" }
      );
    }
    onClose();
    setSelectedReservation(null);
  };

  return (
    <>
      <Stack dir="column" spacing="6">
        {(loaderData.error || actionData?.error) && <GeneralError />}
        <Heading as="h1">My reservations</Heading>
        <Grid templateColumns="repeat(3, 1fr)" gap="6">
          {loaderData.reservations?.map((reservation) => (
            <ReservationCard
              reservation={reservation}
              onCancel={onReservationCancel}
              key={reservation.id}
              cancelling={
                (transition.submission?.formData.get("id") as string) ===
                  reservation.id.toString() && transition.state === "submitting"
              }
              onRate={
                loaderData.reviews?.find((review) => {
                  return review.bike_id === reservation.bike_id;
                })
                  ? undefined
                  : onRatingClicked
              }
            />
          ))}
        </Grid>
      </Stack>
      <Modal onClose={onClose} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={onRating}>
          <ModalHeader>
            Rate {selectedReservation?.bikes.color}{" "}
            {selectedReservation?.bikes.model}
          </ModalHeader>
          <ModalBody>
            <Stack dir="column" spacing="4">
              <RadioGroup
                value={review}
                onChange={(e) => setReview(e)}
                flexDir="column"
              >
                <Stack dir="column">
                  <Radio value="1">1 - Terrible</Radio>
                  <Radio value="2">2 - Not good</Radio>
                  <Radio value="3">3 - Alright</Radio>
                  <Radio value="4">4 - Good</Radio>
                  <Radio value="5">5 - Great</Radio>
                </Stack>
              </RadioGroup>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" colorScheme="blue" isFullWidth>
              Rate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
