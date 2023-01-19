import { supabase } from "~/api";
import { BikeFilter } from "~/components/BikeFilter";
import { Bike } from "~/types/bike";

export const buildBikeFilterQuery = (params: URLSearchParams) => {
  const filter: BikeFilter = {
    model: (params.get("model") as BikeFilter["model"]) || "All",
    color: (params.get("color") as BikeFilter["color"]) || "All",
    rating: (params.get("rating") as BikeFilter["rating"]) || "All",
    city: (params.get("city") as BikeFilter["city"]) || "",
    state: (params.get("state") as BikeFilter["state"]) || "",
  };
  console.log(filter);
  let query = supabase.from<Bike>("bikes").select();
  Object.keys(filter).forEach((key) => {
    const value = filter[key as keyof BikeFilter];
    if (key === "city" || key === "state") {
      if (value) {
        query.ilike(key, `%${value}%`);
      }
    } else if (value === "No rating") {
      query.is("rating", null);
    } else if (value !== "All") {
      query.eq(key as keyof BikeFilter, value);
    }
  });
  return query.order("created_at", { ascending: true });
};
