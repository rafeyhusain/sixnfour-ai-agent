export function copy<T>(item: T) {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2))
}

export function edit<T>(item: T) {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2))
}

export function editor<T>(item: T) {
    console.log("editor", item);
}

export function favorite<T>(item: T) {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2))
}

export function del<T>(data: T[], item: T) {
    if (!item || !Array.isArray(data)) return;

    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (confirmed) {
        const idx = data.indexOf(item);
        if (idx > -1) {
            data.splice(idx, 1);
        }
    }
}

export function clone<T>(data: T[], item: T) {
    console.log(1, data, item);
    // Clone the item, prefix the id with "Copy of ", and add to the top of data
    if (!item || !Array.isArray(data)) return;

    // Deep clone the item to avoid mutating the original
    const clonedItem = { ...(item as Record<string, unknown>) };
    console.log(2, clonedItem);

    if (
        clonedItem &&
        typeof clonedItem === 'object' &&
        clonedItem !== null &&
        Object.prototype.hasOwnProperty.call(clonedItem, 'id')
    ) {
        const id = (clonedItem as Record<string, unknown>).id;
        if (typeof id === 'string' || typeof id === 'number') {
            (clonedItem as Record<string, unknown>).id = `Copy of ${id}`;
        }
    }

    // Insert at the top of the data array
    data.unshift(clonedItem as T);
    console.log(3, data);
}

export function update<T>(key: string, newValue: string, original: T): boolean {
    const originalValue = original[key as keyof T];

    if (originalValue === newValue) {
        return false;
    }

    let castValue: unknown = newValue;

    if (typeof originalValue === "number") {
        castValue = Number(newValue);
    }

    // Type assertion to bypass TS error, but ensure type safety at runtime
    (original as Record<string, unknown>)[key] = castValue;

    return true;
}