import { useEffect, useState } from "react";
import { useDropZoneManager } from "./DropZoneManagerProvider";
import type { Box } from "./Box";
import type { DropZoneProximity } from "~/BaseEditor/defaultConfig/Content/Preview/DropZoneManager";

export interface DropEvent {
    item: { id?: string; componentName: string };
    target: { parentId: string; slot: string; index: number };
}

interface UseProximityDropzoneParams {
    id: string;
    box: Box;
}

export function useProximityDropzone({ id, box }: UseProximityDropzoneParams) {
    const dropzoneManager = useDropZoneManager();
    const [proximity, setProximity] = useState<DropZoneProximity | null>(null);

    useEffect(() => {
        dropzoneManager.register({
            id,
            box,
            onProximityChange: (proximity) => {
                setProximity(proximity);
            }
        });

        return () => {
            dropzoneManager.unregister(id);
        };
    }, [id, box]);

    return { proximity };
}
