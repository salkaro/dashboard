import { NextRequest, NextResponse } from 'next/server';
import { InfluxDB } from '@influxdata/influxdb-client';

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUXDB_TOKEN!;
const org = process.env.INFLUXDB_ORG!;

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const sensorId = searchParams.get('sensorId');
    const retention = searchParams.get('retention');
    let range = searchParams.get('range') ?? '-1h'; // e.g. -1h, -1d

    const bucketMap = {
        "7d": process.env.INFLUX_7D_BUCKET!,
        "30d": process.env.INFLUX_30D_BUCKET!,
        "90d": process.env.INFLUX_90D_BUCKET!,
        "180d": process.env.INFLUX_180D_BUCKET!,
        "365d": process.env.INFLUX_365D_BUCKET!,
    }

    const bucket = bucketMap[retention as keyof typeof bucketMap];

    if (!sensorId) {
        return NextResponse.json({ error: 'Missing sensorId' }, { status: 400 });
    }

    if (!bucket) {
        return NextResponse.json({ error: 'Invalid or missing retention value' }, { status: 400 });
    }

    const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    if (!range.startsWith('-')) {
        range = '-' + range;
    }
    range = range.toLowerCase();

    const fluxQuery = `
        from(bucket: "${bucket}")
            |> range(start: ${range})
            |> filter(fn: (r) => r._measurement == "sensor_reading" and r.sensor == "${sensorId}")
            |> sort(columns: ["_time"])
    `;

    const mergedMap = new Map<string, { timestamp: number; value: number | null; status: string | null }>();

    try {
        await new Promise<void>((resolve, reject) => {
            queryApi.queryRows(fluxQuery, {
                next(row, tableMeta) {
                    const o = tableMeta.toObject(row);
                    const time = o._time;
                    if (!mergedMap.has(time)) {
                        mergedMap.set(time, { timestamp: new Date(time).getTime(), value: null, status: null });
                    }
                    const entry = mergedMap.get(time)!;

                    if (o._field === "value") {
                        entry.value = o._value;
                    } else if (o._field === "status") {
                        entry.status = o._value;
                    }
                },
                error(error) {
                    reject(error);
                },
                complete() {
                    resolve();
                },
            });
        });

        const mergedReadings = Array.from(mergedMap.values());
        return NextResponse.json({ readings: mergedReadings });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
