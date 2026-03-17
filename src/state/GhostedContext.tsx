import { createContext, useContext } from "react";
import { useModelState } from "@view-models/react";
import { GhostedModel } from "./GhostedModel";

export const GhostedContext = createContext(new GhostedModel());

export const useGhostedModel = () => useContext(GhostedContext);

export const useGhostedState = () => {
  const model = useGhostedModel();
  return useModelState(model);
};
