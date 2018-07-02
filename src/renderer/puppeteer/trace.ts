import { NetworkReportEntry } from "types";

export const find_time = (metrics, name) =>
    metrics.metrics.find(x => x.name === name).value;

export const all_with_name = (where: NetworkReportEntry[], name: string) =>
    where.filter((entry) => entry.name === name);