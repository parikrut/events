import Link from "next/link";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            {/* Background Elements - Floating Gradient Orbs */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-10 w-72 h-72 gradient-ai rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
                <div className="absolute top-40 right-10 w-96 h-96 gradient-neural rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "2s" }}></div>
                <div className="absolute bottom-20 left-1/3 w-64 h-64 gradient-cyber rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "4s" }}></div>
            </div>

            <div className="relative z-10 container mx-auto max-w-5xl">
                <div className="text-center space-y-8">
                    <p className="text-lg text-muted-foreground animate-fade-in-up">
                        Custom Event Management Solutions
                    </p>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                        Event Solutions{" "}
                        <span className="text-gradient">Made Simple</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                        Custom software solutions for event planning, budget-friendly RSVP management, and AI-powered photo albums.
                        Everything you need for a perfect event.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                        <a
                            href="https://www.krutikparikh.ca/contact"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 rounded-lg gradient-ai text-white text-base font-medium hover:shadow-lg hover:shadow-primary/25 transition-all inline-flex items-center justify-center"
                        >
                            Get Started
                            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Product 1: Custom Event Solutions
export function CustomSolutionsSection() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="container mx-auto max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Solution 1
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Custom Event Management Solutions
                        </h2>
                        <p className="text-lg text-muted-foreground mb-6">
                            Tailored software solutions for all your event needs. From planning to execution, we build custom tools that fit your unique requirements.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full gradient-ai flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">Local Contacts & Support:</strong> Direct communication and personalized assistance
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full gradient-ai flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">Tailored Solutions:</strong> Custom-built software for your specific event needs
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full gradient-ai flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">End-to-End Support:</strong> From planning to post-event analysis
                                </span>
                            </li>
                        </ul>
                        <a
                            href="https://www.krutikparikh.ca/contact"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-ai text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
                        >
                            Get Custom Solution
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>

                    <div className="relative">
                        <div className="glass p-8 rounded-2xl border border-border">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl gradient-ai flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Event Planning Suite</h3>
                                        <p className="text-sm text-muted-foreground">Comprehensive tools for success</p>
                                    </div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Guest Management</span>
                                            <span className="text-xs text-primary">Active</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Vendor Coordination</span>
                                            <span className="text-xs text-primary">Active</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Budget Tracking</span>
                                            <span className="text-xs text-primary">Active</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Timeline Management</span>
                                            <span className="text-xs text-primary">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 gradient-ai rounded-full blur-3xl opacity-20 -z-10"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Product 2: RSVP System
export function RSVPSection() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 relative">
                        <div className="glass p-8 rounded-2xl border border-border">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl gradient-neural flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">RSVP Dashboard</h3>
                                        <p className="text-sm text-muted-foreground">Real-time tracking</p>
                                    </div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-foreground">Invited: 150</span>
                                            <span className="text-xs text-muted-foreground">100%</span>
                                        </div>
                                        <div className="w-full bg-border rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "73%" }}></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-foreground">Confirmed: 110</span>
                                            <span className="text-xs text-green-600 font-medium">73%</span>
                                        </div>
                                        <div className="pt-2 border-t border-border/50">
                                            <div className="text-lg font-bold text-gradient">Estimated Budget: $8,250</div>
                                            <p className="text-xs text-muted-foreground mt-1">Based on confirmed attendance</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 gradient-neural rounded-full blur-3xl opacity-20 -z-10"></div>
                    </div>

                    <div className="order-1 md:order-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Solution 2
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Smart RSVP Management
                        </h2>
                        <p className="text-lg text-muted-foreground mb-6">
                            Budget your wedding or event accurately by tracking exactly who's coming. No more guessing—plan with confidence.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full gradient-neural flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">Budget Control:</strong> Count only confirmed attendees to save money
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full gradient-neural flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">Real-time Tracking:</strong> Live updates on who's attending
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full gradient-neural flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">Easy Management:</strong> Import guest lists and send invites effortlessly
                                </span>
                            </li>
                        </ul>
                        <a
                            href="https://www.krutikparikh.ca/contact"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-neural text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
                        >
                            Try RSVP
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Product 3: Picasaur
export function PicasaurSection() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="container mx-auto max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Solution 3
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Picasaur: AI-Powered Photo Albums
                        </h2>
                        <p className="text-lg text-muted-foreground mb-6">
                            Digital photo and video albums with intelligent "Find Me" feature. Upload your selfie and AI instantly discovers every photo you appear in.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full gradient-cyber flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">AI Face Recognition:</strong> Upload a selfie, find all your photos instantly
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full gradient-cyber flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">Photo & Video Albums:</strong> Beautiful galleries for all event memories
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full gradient-cyber flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">Easy Sharing:</strong> Share memories with guests effortlessly
                                </span>
                            </li>
                        </ul>
                        <a
                            href="https://www.krutikparikh.ca/contact"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-cyber text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
                        >
                            Try Picasaur
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>

                    <div className="relative">
                        <div className="glass p-8 rounded-2xl border border-border">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl gradient-cyber flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Find Me Feature</h3>
                                        <p className="text-sm text-muted-foreground">AI-powered photo discovery</p>
                                    </div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-muted-foreground">Processing your selfie...</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="aspect-square bg-linear-to-br from-primary/20 to-primary/5 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                        <p className="text-sm font-medium text-foreground">✨ Found 127 photos</p>
                                        <p className="text-xs text-primary">15 videos</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 gradient-cyber rounded-full blur-3xl opacity-20 -z-10"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function CTASection() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Ready to Transform Your Events?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                    Get in touch to discuss custom solutions, RSVP management, or AI-powered photo albums for your next event.
                </p>
                <a
                    href="https://www.krutikparikh.ca/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-lg gradient-ai text-white text-base font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
                >
                    Contact Us Today
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </a>
            </div>
        </section>
    );
}
