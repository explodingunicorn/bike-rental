import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Stack,
} from "@chakra-ui/react";
import { ChangeEvent, FC, useEffect, useState } from "react";
import {
  Bike,
  BikeColors,
  bikeColorsArr,
  BikeModels,
  bikeModelsArr,
} from "~/types/bike";

export interface BikeEditorProps {
  bike?: Bike;
  onSubmit: (bike: Bike, type: "create" | "edit") => void;
  onClose: () => void;
}

const baseBike: Bike = {
  id: 1,
  created_at: new Date(),
  model: BikeModels.Giant,
  color: BikeColors.Black,
  city: "",
  state: "",
  can_rent: true,
  rating: null,
};

export const BikeEditor: FC<BikeEditorProps> = ({
  bike,
  onSubmit,
  onClose,
}) => {
  const [bikeForm, setBikeForm] = useState(() => {
    return bike ? { ...bike } : baseBike;
  });

  const onBikeFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBikeForm((old) => {
      return {
        ...old,
        [e.target.name]:
          e.target.type.toLowerCase() === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : e.target.value,
      };
    });
  };

  useEffect(() => {
    setBikeForm(bike ? { ...bike } : baseBike);
  }, [bike]);

  return (
    <Stack
      as="form"
      dir="column"
      spacing={4}
      onSubmit={(e) => e.preventDefault()}
    >
      <FormControl>
        <FormLabel>Color</FormLabel>
        <Select value={bikeForm.color} onChange={onBikeFormChange} name="color">
          {bikeColorsArr.map((color) => {
            return (
              <option value={color} key={color}>
                {color}
              </option>
            );
          })}
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel>Model</FormLabel>
        <Select value={bikeForm.model} onChange={onBikeFormChange} name="model">
          {bikeModelsArr.map((model) => {
            return (
              <option value={model} key={model}>
                {model}
              </option>
            );
          })}
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel>City</FormLabel>
        <Input value={bikeForm.city} name="city" onChange={onBikeFormChange} />
      </FormControl>
      <FormControl>
        <FormLabel>State</FormLabel>
        <Input
          value={bikeForm.state}
          name="state"
          onChange={onBikeFormChange}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Available to rent</FormLabel>
        <Checkbox
          isChecked={bikeForm.can_rent}
          name="can_rent"
          onChange={onBikeFormChange}
          type="checkbox"
        />
      </FormControl>
      <HStack spacing="4" justifyContent={"end"}>
        <Button colorScheme="gray" variant="ghost" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button
          colorScheme="green"
          onClick={() => onSubmit(bikeForm, bike ? "edit" : "create")}
        >
          {bike ? "Submit changes" : "Create new bike"}
        </Button>
      </HStack>
    </Stack>
  );
};
