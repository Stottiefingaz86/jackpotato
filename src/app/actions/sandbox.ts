"use server";

import { revalidatePath } from "next/cache";
import {
  setSimulatorSpeed,
  startSimulator,
  stopSimulator,
} from "@/lib/simulator";
import { store } from "@/lib/data/store";

export async function setSimSpeed(ms: number) {
  setSimulatorSpeed(ms);
  revalidatePath("/admin/sandbox");
}

export async function toggleSimulator() {
  if (store.simulatorRunning) {
    stopSimulator();
  } else {
    startSimulator();
  }
  revalidatePath("/admin/sandbox");
}
