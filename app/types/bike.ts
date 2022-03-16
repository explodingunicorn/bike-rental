const getEnumNames = <T>(enumerator: { [key: string]: string }) => {
  return Object.values(enumerator);
};

export enum BikeModels {
  Giant = "Giant",
  Trek = "Trek",
  Diamondback = "Diamondback",
  Huffy = "Huffy",
  Schwinn = "Schwinn",
  Mongoose = "Mongoose",
}

export const bikeModelsArr = getEnumNames<BikeModels>(BikeModels);

export enum BikeColors {
  Red = "Red",
  Green = "Green",
  Blue = "Blue",
  Orange = "Orange",
  Yellow = "Yellow",
  Purple = "Purple",
  Black = "Black",
}

export const bikeColorsArr = getEnumNames<BikeModels>(BikeColors);

export type Bike = {
  id: number;
  created_at: Date;
  model: BikeModels;
  color: BikeColors;
  city: string;
  state: string;
  can_rent: boolean;
  rating: number | null;
};
