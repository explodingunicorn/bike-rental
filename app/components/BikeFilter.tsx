import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
} from "@chakra-ui/react";
import { ChangeEvent, FC, useMemo, useState } from "react";
import {
  Bike,
  BikeColors,
  bikeColorsArr,
  BikeModels,
  bikeModelsArr,
} from "~/types/bike";

export interface BikeFilterProps {
  color: keyof typeof BikeColors | "All";
  model: keyof typeof BikeModels | "All";
  rating: Bike["rating"] | "All" | "No rating";
  city: Bike["city"];
  state: Bike["state"];
  onChange: (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onSubmit: (e: {
    model: BikeFilterProps["model"];
    color: BikeFilterProps["color"];
    rating: BikeFilterProps["rating"];
    city: BikeFilterProps["city"];
    state: BikeFilterProps["state"];
  }) => void;
  loading: boolean;
}

export type BikeFilter = Pick<
  BikeFilterProps,
  "color" | "model" | "rating" | "city" | "state"
>;

export const useBikeFilter = (initialFilter?: BikeFilter) => {
  const [bikeFilter, setBikeFilter] = useState<BikeFilter>(
    () =>
      initialFilter || {
        color: "All",
        model: "All",
        rating: "All",
        city: "",
        state: "",
      }
  );
  return [
    bikeFilter,
    (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setBikeFilter((filters) => {
        return { ...filters, [e.target.name]: e.target.value };
      });
    },
    setBikeFilter,
  ] as const;
};

export const BikeFilter: FC<BikeFilterProps> = ({
  color,
  model,
  rating,
  city,
  state,
  onSubmit,
  onChange,
  loading,
}) => {
  const bikeColorFilters = useMemo(() => {
    return ["All", ...bikeColorsArr];
  }, []);
  const bikeModelFilters = useMemo(() => {
    return ["All", ...bikeModelsArr];
  }, []);
  const ratingFilters = ["All", 5, 4, 3, 2, 1, "No rating"];

  return (
    <HStack
      dir="row"
      as="form"
      onSubmit={(e) => e.preventDefault()}
      spacing="4"
      alignItems={"end"}
    >
      <Flex flex="50%" gap="4">
        <FormControl>
          <FormLabel>Color</FormLabel>
          <Select value={color} onChange={onChange} name="color">
            {bikeColorFilters.map((filter) => (
              <option value={filter} key={filter}>
                {filter}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Model</FormLabel>
          <Select value={model} onChange={onChange} name="model">
            {bikeModelFilters.map((filter) => (
              <option value={filter} key={filter}>
                {filter}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Rating</FormLabel>
          <Select
            value={rating || "No rating"}
            onChange={onChange}
            name="rating"
          >
            {ratingFilters.map((filter) => (
              <option value={filter} key={filter}>
                {filter}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>City</FormLabel>
          <Input value={city} onChange={onChange} name="city" />
        </FormControl>
        <FormControl>
          <FormLabel>State</FormLabel>
          <Input value={state} onChange={onChange} name="state" />
        </FormControl>
      </Flex>
      <Button
        colorScheme={"blue"}
        variant="ghost"
        isLoading={loading}
        onClick={() => onSubmit({ model, color, rating, city, state })}
      >
        Filter
      </Button>
    </HStack>
  );
};
