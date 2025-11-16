import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg gradient-ai flex items-center justify-center">
                            <span className="text-white font-bold text-xs">KP</span>
                        </div>
                        <span className="text-sm text-muted-foreground">© 2025 Event Solutions by Krutik Parikh. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href="https://krutikparikh.ca"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                        >
                            Visit Portfolio
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
