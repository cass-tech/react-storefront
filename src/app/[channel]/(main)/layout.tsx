import { type ReactNode } from "react";
import { Footer } from "@/ui/components/Footer";
import { Header } from "@/ui/components/Header";

export const metadata = {
	title: "Saleor Storefront example",
	description: "Starter pack for building performant e-commerce experiences with Saleor.",
};

export default function RootLayout(props: { children: ReactNode; params: { channel: string } }) {
	return (
		<>
			<Header channel={props.params.channel} />
			<div className="relative flex min-h-screen flex-col">
				<main className="backgroundImage relative flex-1 text-neutral-300">{props.children}</main>
				<Footer channel={props.params.channel} />
			</div>
		</>
	);
}
