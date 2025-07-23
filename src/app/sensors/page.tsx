import Layout from "@/components/layout/layout";
import Page from "@/components/sensors/Page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Salkaro | Sensors",
    description: "Salkaro sensors dashboard",
    robots: {
        index: false,
        follow: false,
        nocache: false,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function Sensors() {
    return (
        <Layout>
            <Page />
        </Layout>
    );
}
