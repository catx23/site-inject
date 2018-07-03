import { NetworkReportEntry, TraceEntry } from "types";

export const find_time = (metrics, name) =>
    metrics.metrics.find(x => x.name === name).value;

export const all_with_name = (where: NetworkReportEntry[], name: string) =>
    where.filter((entry) => entry.name === name);

/*
export const tree = (entries: TraceEntry[]) => {
    const tasks = [];
    let currentTask;

    for (const event of entries) {
        // Only look at X (Complete), B (Begin), and E (End) events as they have most data
        if (event.ph !== 'X' && event.ph !== 'B' && event.ph !== 'E') continue;

        // Update currentTask based on the elapsed time.
        // The next event may be after currentTask has ended.
        while (
            currentTask &&
            Number.isFinite(currentTask.endTime) &&
            currentTask.endTime <= event.ts
        ) {
            currentTask = currentTask.parent;
        }

        if (!currentTask) {
            // We can't start a task with an end event
            if (event.ph === 'E') {
                throw new Error('Fatal trace logic error');
            }

            currentTask = entries._createNewTaskNode(event);
            tasks.push(currentTask);

            continue;
        }

        if (event.ph === 'X' || event.ph === 'B') {
            // We're starting a nested event, create it as a child and make it the currentTask
            const newTask = entries._createNewTaskNode(event, currentTask);
            tasks.push(newTask);
            currentTask = newTask;
        } else {
            if (currentTask.event.ph !== 'B') {
                throw new Error('Fatal trace logic error');
            }

            // We're ending an event, update the end time and the currentTask to its parent
            currentTask.endTime = event.ts;
            currentTask = currentTask.parent;
        }
    }
    return tasks;
}
*/