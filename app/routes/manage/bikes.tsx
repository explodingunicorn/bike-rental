import {
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  ActionFunction,
  json,
  LoaderFunction,
  useFetcher,
  useLoaderData,
  useSearchParams,
  useTransition,
  useSubmit,
} from "remix";
import { supabase } from "~/api";
import { BikeCard } from "~/components/BikeCard";
import { BikeEditor } from "~/components/BikeEditor";
import { BikeFilter, useBikeFilter } from "~/components/BikeFilter";
import { Bike } from "~/types/bike";
import { buildBikeFilterQuery } from "~/utils/buildBikeFilterQuery";
import { setApiAuth } from "~/utils/setApiAuth";

export const loader: LoaderFunction = async ({ request }) => {
  //const formData = await request.formData();
  const url = request.url;
  const queryParams = new URL(url).searchParams;
  await setApiAuth(request);
  let bikeQuery: PostgrestFilterBuilder<Bike>;
  if (queryParams.has("model")) {
    bikeQuery = buildBikeFilterQuery(queryParams);
  } else {
    bikeQuery = supabase
      .from<Bike>("bikes")
      .select()
      .order("created_at", { ascending: true });
  }
  const { data: bikes } = await bikeQuery;
  return json({ bikes });
};

export const action: ActionFunction = async ({ request }) => {
  const { method } = request;
  const formData = await request.formData();
  await setApiAuth(request);
  if (method === "DELETE") {
    const id = formData.get("id");
    if (id) {
      const { error, data } = await supabase
        .from("bikes")
        .delete()
        .eq("id", id);
      return json({ error, data });
    }
  }
  if (method === "POST") {
    const type = formData.get("type");
    const bikeStr = formData.get("bike") as string;
    const bike: Bike = JSON.parse(bikeStr);
    if (type === "create") {
      const { error, data } = await supabase.from("bikes").insert([
        {
          model: bike.model,
          color: bike.color,
          city: bike.city,
          state: bike.state,
          can_rent: bike.can_rent,
        },
      ]);
      return json({ error, data });
    } else if (type === "edit") {
      const { error, data } = await supabase
        .from("bikes")
        .update({
          model: bike.model,
          color: bike.color,
          city: bike.city,
          state: bike.state,
          can_rent: bike.can_rent,
        })
        .eq("id", bike.id);
      return json({ error, data });
    }
  }
  return null;
};

export default function ManageBikes() {
  const [searchParams] = useSearchParams();
  const [bikeFilter, setBikeFilter, overrideBikeFilter] = useBikeFilter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalData, setModalData] = useState<{
    type: "edit" | "create";
    bike: Bike | undefined;
  } | null>();
  const submit = useSubmit();
  const loaderData = useLoaderData<{ bikes?: Bike[] }>();
  const transition = useTransition();
  const requestFetcher = useFetcher<{ bikes: Bike[] }>();

  const onCreateClick = () => {
    setModalData({ type: "create", bike: undefined });
    onOpen();
  };

  const onBikeEditClick = (bike: Bike) => {
    setModalData({ type: "edit", bike });
    onOpen();
  };

  const onBikeDelete = (bike: Bike) => {
    requestFetcher.submit({ id: bike.id.toString() }, { method: "delete" });
  };

  const onBikeFormSubmit = (bike: Bike, type: "edit" | "create") => {
    requestFetcher.submit(
      { bike: JSON.stringify(bike), type, id: bike.id.toString() },
      { method: "post" }
    );

    onClose();
  };

  const onFilterSubmit = (filter: BikeFilter) => {
    submit(
      {
        color: filter.color,
        model: filter.model,
        rating:
          typeof filter.rating === "string"
            ? filter.rating
            : filter.rating?.toString() || "All",
        city: filter.city,
        state: filter.state,
      },
      { method: "get" }
    );
  };

  useEffect(() => {
    overrideBikeFilter({
      model: (searchParams.get("model") as BikeFilter["model"]) || "All",
      color: (searchParams.get("color") as BikeFilter["color"]) || "All",
      rating: (searchParams.get("rating") as BikeFilter["rating"]) || "All",
      city: (searchParams.get("city") as BikeFilter["city"]) || "",
      state: (searchParams.get("state") as BikeFilter["state"]) || "",
    });
  }, [searchParams]);

  return (
    <>
      <Stack dir="column" spacing="8">
        <Flex dir="row" alignItems={"center"} justifyContent="space-between">
          <Heading as="h1">Manage Bikes</Heading>
          <Button
            colorScheme={"green"}
            onClick={onCreateClick}
            leftIcon={<FaPlus />}
          >
            Create new bike
          </Button>
        </Flex>
        <BikeFilter
          {...bikeFilter}
          onChange={setBikeFilter}
          onSubmit={onFilterSubmit}
          loading={transition.state === "submitting"}
        />
        <Grid
          templateColumns={"repeat(3, 1fr)"}
          gap="4"
          gridAutoRows="min-content"
          alignItems="stretch"
        >
          {loaderData.bikes?.map((bike) => (
            <GridItem key={bike.id}>
              <BikeCard
                bike={bike}
                manage
                onDelete={onBikeDelete}
                onEdit={onBikeEditClick}
                deleting={
                  requestFetcher.submission?.method === "DELETE" &&
                  Number(requestFetcher.submission?.formData.get("id")) ===
                    bike.id
                }
                editing={
                  requestFetcher.submission?.method === "POST" &&
                  requestFetcher.submission.formData.get("type") === "edit" &&
                  Number(requestFetcher.submission?.formData.get("id")) ===
                    bike.id
                }
              />
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
      </Stack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modalData?.type === "edit" ? "Edit bike" : "Create bike"}
          </ModalHeader>
          <ModalBody>
            <BikeEditor
              bike={modalData?.bike}
              onSubmit={onBikeFormSubmit}
              onClose={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
