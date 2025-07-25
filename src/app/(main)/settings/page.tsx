import Layout from "@/components/layout/layout";
import Page from "@/components/main/settings/Page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Salkaro | Settings",
    description: "Salkaro settings dashboard",
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

export default function Settings() {
    return (
        <Layout>
            <Page />
        </Layout>
    );
}
