import { notFound } from "next/navigation";
import { getEventBySlug, getAllEventSlugs } from "@/lib/actions/events";
import { HeartLogo } from "@/components/heart-logo";
import { RSVPForm } from "@/components/rsvp-form";

interface EventPageProps {
    params: Promise<{ slug: string }>;
}

// Generate static params for all events
export async function generateStaticParams() {
    const slugs = await getAllEventSlugs();
    return slugs.map((slug) => ({
        slug: slug,
    }));
}

export default async function EventPage({ params }: EventPageProps) {
    const { slug } = await params;
    const eventData = await getEventBySlug(slug);

    if (!eventData) {
        notFound();
    }

    // For wedding events, extract first letters for logo
    const groomInitial = eventData.groomName?.[0] || "G";
    const brideInitial = eventData.brideName?.[0] || "B";

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Enhanced decorative background with gradient split */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Groom side - Blue gradient (left half) */}
                <div className="absolute inset-y-0 left-0 right-1/2 bg-linear-to-br from-blue-100 via-blue-50 to-purple-50"></div>

                {/* Bride side - Pink gradient (right half) */}
                <div className="absolute inset-y-0 left-1/2 right-0 bg-linear-to-bl from-rose-100 via-pink-50 to-purple-50"></div>

                {/* Decorative blurred circles - Blue (Groom side) */}
                <div className="absolute top-10 left-10 w-96 h-96 bg-linear-to-br from-blue-300/30 to-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-linear-to-tr from-indigo-300/25 to-blue-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

                {/* Decorative blurred circles - Pink (Bride side) */}
                <div className="absolute top-20 right-10 w-80 h-80 bg-linear-to-bl from-pink-300/30 to-rose-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-linear-to-tl from-rose-200/20 to-pink-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>

                {/* Center gradient blend */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-purple-100/30 to-transparent"></div>
            </div>

            {/* Header with names and logo */}
            <header className="relative z-20 p-4 md:p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-row justify-between items-center gap-2 md:gap-4">
                        {/* Groom Name - Left */}
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-linear-to-r from-blue-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent truncate max-w-[30%]">
                            {eventData.groomName || "Groom"}
                        </h2>

                        {/* Heart Logo - Center */}
                        <div className="shrink-0">
                            <HeartLogo
                                groomInitial={groomInitial}
                                brideInitial={brideInitial}
                                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20"
                            />
                        </div>

                        {/* Bride Name - Right */}
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-linear-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent truncate max-w-[30%] text-right">
                            {eventData.brideName || "Bride"}
                        </h2>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="relative z-20 min-h-[calc(100vh-100px)] flex items-center justify-center px-4 py-8 md:px-6 md:py-12">
                <div className="w-full max-w-4xl">
                    {/* Event Title */}
                    <div className="text-center mb-8 md:mb-12">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-3 md:mb-4 px-2">
                            {eventData.title}
                        </h1>
                        {eventData.description && (
                            <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto px-4 mb-8">
                                {eventData.description}
                            </p>
                        )}
                    </div>

                    {/* RSVP Form */}
                    <RSVPForm eventData={{
                        id: eventData.id,
                        lineupId: eventData.id,
                        slug: eventData.slug,
                        title: eventData.title,
                        groomName: eventData.groomName,
                        brideName: eventData.brideName,
                    }} />
                </div>
            </main>
        </div>
    );
}
