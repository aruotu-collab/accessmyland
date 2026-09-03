import { mergePlanningScan, recordPlanningError } from "./admin-store";
import { fetchLincolnshireDeals } from "./planning-watch";

export async function runPlanningScan() {
  try {
    const found = await fetchLincolnshireDeals();
    return await mergePlanningScan(found);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scan failed.";
    await recordPlanningError(message);
    throw error;
  }
}
