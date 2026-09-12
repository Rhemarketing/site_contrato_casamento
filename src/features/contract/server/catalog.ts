import "server-only";
import data from "@/data/contract-master-v1.4.0.json";
import type { Catalog } from "../domain/types";

export const contractCatalog = data as unknown as Catalog;
