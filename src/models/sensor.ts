type IReadingType = number | string | boolean | null;

/** Metadata for each sensor, stored in Firebase */
interface ISensorMeta {
    id?: string | null;            // Unique sensor ID
    name?: string | null;          // Human-readable name
    model?: string | null;         // Optional model name
    location?: string | null;      // e.g. "warehouse-A", "kitchen"
    units?: string | null;         // e.g. "°C", "µPa"
    orgId?: string | null;         // Associated organization or user
    createdAt?: number | null;     // ISO timestamp in Firebase
}

/** Single time-series data point, written to InfluxDB */
interface ISensorReading {
    sensorId?: string | null;     // Tag
    timestamp?: number | null;    // ISO timestamp—or nanosecond epoch via client lib
    value?: IReadingType;         // Field
    status?: string | null;       // Field—e.g. “OK”, “WARN”, “FAULT”
}


export type { ISensorMeta, ISensorReading, IReadingType }