// External Imports
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { BookText, Home, Key, LucideProps, RadioTower, SearchIcon, Settings, Store, UserRound, Wallet } from 'lucide-react';

// Local Imports
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { levelThreeAccess, levelTwoAccess } from '@/utils/constants';
import { useSensors } from '@/hooks/useSensors';
import NoContent from './no-content';
import { Input } from './input';


interface IItem {
    title: string;
    description: string;
    type: "page" | "device";
    link: string;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    subItems?: IItem[];
}

const OrganisationSearch: React.FC = () => {
    const router = useRouter();
    const { sensors } = useSensors();
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();
    const [query, setQuery] = useState("");
    const [items, setItems] = useState<IItem[]>([]);

    const hasLevelTwoAccess = levelTwoAccess.includes(session?.user.organisation?.role as string);
    const hasLevelThreeAccess = levelThreeAccess.includes(session?.user.organisation?.role as string);

    useEffect(() => {
        const handle = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        window.addEventListener("keydown", handle);
        return () => window.removeEventListener("keydown", handle);
    }, []);


    useEffect(() => {
        // Start with base items
        const baseItems: IItem[] = [
            {
                title: "Dashboard",
                description: "Overview on organisation",
                type: "page",
                link: "/",
                icon: Home,
            },
            {
                title: "Sensors",
                description: "View sensor information",
                type: "page",
                link: "/sensors",
                icon: RadioTower,
            },
            {
                title: "Settings",
                description: "Customize organisation data, create api keys & add members",
                type: "page",
                link: "/settings",
                icon: Settings,
            },
            {
                title: "Documentation",
                description: "Docs for uploading sensor data & more",
                type: "page",
                link: "https://docs.salkaro.com",
                icon: BookText,
            },
        ];

        let sensorSubItems: IItem[];
        if (sensors) {
            // Inject sensor sub-items under "Sensors"
            sensorSubItems = sensors.map((s) => ({
                title: s.name ?? `Sensor ${s.id}`,
                description: `${s.model ?? ""} • ${s.location ?? ""}`.trim(),
                type: "device",
                link: `/sensors/${s.id}`,
                icon: RadioTower,
            }));
        };

        // Build settings sub-items dynamically based on access level
        const settingsSubItems: IItem[] = [
            {
                title: "Overview",
                description: "Edit personal information",
                type: "page",
                link: "/settings#overview",
                icon: UserRound,
            },
            {
                title: "Organisation",
                description: "Edit organisational data & add members",
                type: "page",
                link: "/settings#organisation",
                icon: Store,
            },
            ...(hasLevelTwoAccess ? [
                {
                    title: "Authentication",
                    description: "Create & edit API keys",
                    type: "page",
                    link: "/settings#authentication",
                    icon: Key,
                }] as IItem[] : []),
            ...(hasLevelThreeAccess
                ? [
                    {
                        title: "Billing",
                        description: "View billing & manage memberships",
                        type: "page",
                        link: "/settings#billing",
                        icon: Wallet,
                    },
                ] as IItem[]
                : []),
        ];

        // Generate final items list
        setItems(
            baseItems.map((it) => {
                if (it.title === "Sensors") {
                    return { ...it, subItems: sensorSubItems };
                }
                if (it.title === "Settings") {
                    return { ...it, subItems: settingsSubItems };
                }
                return it;
            })
        );
    }, [sensors, hasLevelThreeAccess, hasLevelTwoAccess]);

    useEffect(() => {
        if (sensors) {
            const sensorSubItems: IItem[] = sensors.map(sensor => ({
                title: sensor.name ?? `Sensor ${sensor.id}`,
                description: `${sensor.model ?? "Model unknown"} - ${sensor.location ?? "Location unknown"}`,
                type: "device",
                link: `/sensors/${sensor.id}`,
                icon: RadioTower,
            }));

            setItems(prevItems =>
                prevItems.map(item =>
                    item.title === "Sensors"
                        ? { ...item, subItems: sensorSubItems }
                        : item
                )
            );
        }
    }, [sensors]);

    const lowercase = (str?: string) => str?.toLowerCase() ?? "";

    const filtered = items
        .flatMap((it) =>
            it.subItems
                ? [it, ...it.subItems]
                : [it]
        )
        .filter((it) =>
            lowercase(it.title).includes(lowercase(query)) ||
            lowercase(it.description).includes(lowercase(query))
        );

    const grouped = [
        ...new Map(filtered.map((it) => [it.type, filtered.filter(i => i.type === it.type)]))
            .entries()
    ] as [string, IItem[]][];


    return (
        <div className="w-full max-w-sm">
            {/* Trigger input */}
            <div
                onClick={() => setOpen(true)}
                className="relative w-full max-w-sm cursor-text"
            >
                <SearchIcon
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 text-gray-400 -translate-y-1/2"
                />
                <Input
                    placeholder="Quick search"
                    readOnly
                    className="pl-10 pr-20 rounded-full h-8"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 flex items-center -translate-y-1/2 text-xs">
                    <span className="text-gray-500">Ctrl</span>
                    <span className="text-gray-500">+</span>
                    <span className="text-gray-400">K</span>
                </div>
            </div>

            {/* Command dialog */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    autoFocus
                    placeholder="Quick search"
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty><NoContent text="No results found" /></CommandEmpty>
                    {grouped.map(([type, group]) => (
                        <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1) + "s"}>
                            {group.map((it) => (
                                <CommandItem
                                    key={it.link}
                                    onSelect={() => {
                                        setOpen(false);
                                        router.push(it.link);
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <div className='flex flex-row items-center gap-2'>
                                            <it.icon size={20} className='text-xs' />
                                            <span>{it.title}</span>
                                        </div>
                                        <small className="text-muted-foreground">
                                            {it.description}
                                        </small>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ))}
                </CommandList>
            </CommandDialog>
        </div>
    );
};

export default OrganisationSearch;
