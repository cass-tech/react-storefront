import { Logo } from "./Logo";
import { Nav } from "./nav/Nav";

export function Header({ channel }: { channel: string }) {
	return (
		<header className="sticky top-0 z-20 bg-orange-950 backdrop-blur-md">
			<div className="flex items-center justify-center py-1">
				<Logo />
			</div>
			<div className="mx-auto max-w-7xl px-3 sm:px-8">
				<div className="flex h-16 justify-between gap-4 md:gap-8">
					<Nav channel={channel} />
				</div>
			</div>
		</header>
	);
}
