import Link from "next/link";

export function Navigation() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 glass backdrop-blur">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-ai">
                            <span className="text-sm font-bold text-white">KP</span>
                        </div>
                        <span className="text-lg font-bold text-gradient">Event Solutions</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <a
                            href="https://www.krutikparikh.ca/contact"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}