import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/actions/events";
import { HeartLogo } from "@/components/heart-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ThankYouPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ name?: string; email?: string; events?: string }>;
}

export default async function ThankYouPage({ params, searchParams }: ThankYouPageProps) {
    const { slug } = await params;
    const { name, email, events } = await searchParams;

    const eventData = await getEventBySlug(slug);

    if (!eventData) {
        notFound();
    }

    const attendingCount = events ? parseInt(events) : 0;
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
                <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader className="text-center pb-4">
                        <div className="mb-4">
                            <div className="w-20 h-20 mx-auto bg-linear-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-4xl text-white">✓</span>
                            </div>
                        </div>
                        <CardTitle className="text-3xl mb-2 bg-linear-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                            Thank You{name ? `, ${name}` : ''}!
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Your RSVP has been confirmed 🎉
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Confirmation Message */}
                            <div className="bg-linear-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-purple-100">
                                <p className="text-gray-700 text-center leading-relaxed">
                                    We&apos;re thrilled to confirm your attendance for{' '}
                                    {attendingCount > 0 && (
                                        <>
                                            <strong>{attendingCount}</strong> {attendingCount === 1 ? 'event' : 'events'}.{' '}
                                        </>
                                    )}
                                    We can&apos;t wait to celebrate these beautiful moments with you!
                                </p>
                            </div>

                            {/* Email Confirmation */}
                            {email && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl mt-1">📧</span>
                                        <div>
                                            <p className="font-semibold text-blue-900 mb-1">Check Your Email</p>
                                            <p className="text-sm text-blue-800">
                                                A confirmation email with calendar invites has been sent to{' '}
                                                <strong className="text-blue-900">{email}</strong>
                                            </p>
                                            <p className="text-xs text-blue-700 mt-2">
                                                💡 Tip: Add the calendar file to your calendar for automatic reminders!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Important Reminders */}
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl mt-1">⚠️</span>
                                    <div>
                                        <p className="font-semibold text-amber-900 mb-2">Important Reminders</p>
                                        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                                            <li>Please arrive 15-20 minutes before the event start time</li>
                                            <li>Dress according to the specified dress code</li>
                                            <li>Contact us if you need to make any changes to your RSVP</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Closing Message */}
                            <div className="text-center pt-4 border-t border-gray-200">
                                <p className="text-gray-600 mb-2">
                                    If you have any questions or special requirements, please don&apos;t hesitate to reach out.
                                </p>
                                <p className="text-xl font-semibold bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                                    See you there! 💕
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
