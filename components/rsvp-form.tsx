"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormDescription,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkGuestByName, submitRSVP } from "@/lib/actions/rsvp";
import { useToast } from "@/hooks/use-toast";

interface EventData {
    id: string;
    organizerId: string;
    slug: string;
    title: string;
    groomName: string | null;
    brideName: string | null;
}

interface EventDetails {
    id: string;
    name: string;
    date: Date;
    time: string;
    venue: string;
    address: string;
    addressUrl: string | null;
    dressCode: string | null;
}

interface RSVPFormProps {
    eventData: EventData;
}

// Step 1 Schema
const step1Schema = z.object({
    fullName: z.string().min(2, "Please enter your full name"),
    email: z.string().email("Please enter a valid email address"),
});

// Step 2 Schema
const step2Schema = z.object({
    events: z.array(
        z.object({
            eventId: z.string(),
            isAttending: z.boolean(),
            attendeeCount: z.number().min(1),
        })
    ),
});

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;

interface GuestWithEvents {
    id: string;
    fullName: string;
    email: string;
    attendeeLimit: number;
    invitations: Array<{
        event: EventDetails;
    }>;
}

export function RSVPForm({ eventData }: RSVPFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [guestData, setGuestData] = useState<GuestWithEvents | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [step1Data, setStep1Data] = useState<Step1FormData | null>(null);
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [attendAll, setAttendAll] = useState(false);
    const { toast } = useToast();

    const step1Form = useForm<Step1FormData>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            fullName: "",
            email: "",
        },
    });

    const step2Form = useForm<Step2FormData>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            events: [],
        },
    });

    const onStep1Submit = async (data: Step1FormData) => {
        try {
            setIsCheckingName(true);
            const response = await checkGuestByName(data.fullName, eventData.organizerId);

            if (!response.success) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: response.error || "Failed to check guest name",
                });
                return;
            }

            if (response.matched && response.guest) {
                setGuestData(response.guest as GuestWithEvents);
                setStep1Data(data);

                // Initialize step 2 form with events
                const eventDefaults = response.guest.invitations.map((invitation) => ({
                    eventId: invitation.event.id,
                    isAttending: false,
                    attendeeCount: response.guest.attendeeLimit > 0 ? response.guest.attendeeLimit : 1,
                }));

                step2Form.reset({ events: eventDefaults });
                setStep(2);
            } else if (response.suggestions && response.suggestions.length > 0) {
                setSuggestions(response.suggestions);
            } else {
                toast({
                    variant: "destructive",
                    title: "Guest Not Found",
                    description: "We couldn't find your name in our guest list. Please check the spelling and try again.",
                });
            }
        } catch (error) {
            console.error("Error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An error occurred. Please try again.",
            });
        } finally {
            setIsCheckingName(false);
        }
    };

    const selectSuggestion = (name: string) => {
        step1Form.setValue("fullName", name);
        setSuggestions([]);
        step1Form.handleSubmit(onStep1Submit)();
    };

    const onStep2Submit = async (data: Step2FormData) => {
        if (!step1Data || !guestData) return;

        try {
            setIsSubmitting(true);
            const response = await submitRSVP({
                guestId: guestData.id,
                email: step1Data.email,
                responses: data.events,
            });

            if (response.success) {
                // Count attending events
                const attendingCount = data.events.filter(e => e.isAttending).length;

                // Redirect to thank you page with query params
                router.push(
                    `/events/${eventData.slug}/thank-you?` +
                    `name=${encodeURIComponent(step1Data.fullName)}&` +
                    `email=${encodeURIComponent(step1Data.email)}&` +
                    `events=${attendingCount}`
                );
            } else {
                toast({
                    variant: "destructive",
                    title: "Submission Failed",
                    description: response.message,
                });
            }
        } catch (error) {
            console.error("Error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An error occurred. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${step === 1 ? "text-blue-600" : "text-gray-500"}`}>
                        Step 1: Your Details
                    </span>
                    <span className={`text-sm font-medium ${step === 2 ? "text-blue-600" : "text-gray-500"}`}>
                        Step 2: Event Selection
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(step / 2) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step 1: Guest Information */}
            {step === 1 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xl">Welcome! 🎉</CardTitle>
                        <CardDescription>
                            Please enter your details to see your personalized invitation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormProvider {...step1Form}>
                            <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
                                <FormItem>
                                    <FormLabel>Full Name *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="John Doe"
                                            {...step1Form.register("fullName")}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter your first and last name as it appears on the invitation
                                    </FormDescription>
                                    <FormMessage error={step1Form.formState.errors.fullName} />
                                </FormItem>

                                {suggestions.length > 0 && (
                                    <div className="p-3 border rounded-lg bg-red-50 border-red-200">
                                        <p className="font-medium mb-2 text-sm text-red-800">
                                            Did you mean:
                                        </p>
                                        <div className="space-y-1.5">
                                            {suggestions.map((name, index) => (
                                                <Button
                                                    key={index}
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-start h-8 text-sm bg-white hover:bg-gray-50"
                                                    onClick={() => selectSuggestion(name)}
                                                >
                                                    {name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <FormItem>
                                    <FormLabel>Email Address *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            {...step1Form.register("email")}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        We&apos;ll send confirmation to this email
                                    </FormDescription>
                                    <FormMessage error={step1Form.formState.errors.email} />
                                </FormItem>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isCheckingName}
                                >
                                    {isCheckingName ? "Checking..." : "Continue to Event Selection"}
                                </Button>
                            </form>
                        </FormProvider>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Event Selection */}
            {step === 2 && step1Data && guestData && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl">Hello, {step1Data.fullName}! 👋</CardTitle>
                                <CardDescription>
                                    Please let us know which events you&apos;ll be attending
                                </CardDescription>
                            </div>

                            {/* Attend All Checkbox */}
                            {guestData.invitations.length > 1 && (
                                <div className="flex items-center space-x-2 shrink-0">
                                    <Checkbox
                                        checked={attendAll}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const checked = e.target.checked;
                                            setAttendAll(checked);
                                            // Update all events
                                            guestData.invitations.forEach((_, index) => {
                                                step2Form.setValue(`events.${index}.isAttending`, checked);
                                            });
                                        }}
                                    />
                                    <FormLabel className="mt-0! text-sm font-semibold cursor-pointer text-purple-700 whitespace-nowrap">
                                        ✨ Attend All Events
                                    </FormLabel>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <FormProvider {...step2Form}>
                            <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
                                <div className="space-y-3">{guestData.invitations.map((invitation, index) => {
                                    const event = invitation.event;
                                    const isAttending = step2Form.watch(`events.${index}.isAttending`);

                                    return (
                                        <div key={event.id} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <h3 className="font-semibold text-base">{event.name}</h3>
                                                <div className="text-xs text-gray-600 whitespace-nowrap">
                                                    {new Date(event.date).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })} • {event.time}
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-600">
                                                📍 {event.addressUrl ? (
                                                    <a
                                                        href={event.addressUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                    >
                                                        {event.venue}
                                                    </a>
                                                ) : event.address ? (
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                    >
                                                        {event.venue}
                                                    </a>
                                                ) : (
                                                    <span>{event.venue}</span>
                                                )}
                                                {event.dressCode && <span className="ml-2">• 👔 {event.dressCode}</span>}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    checked={isAttending}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        step2Form.setValue(`events.${index}.isAttending`, e.target.checked)
                                                    }
                                                />
                                                <FormLabel className="mt-0! text-sm font-medium cursor-pointer">
                                                    I will attend this event
                                                </FormLabel>
                                            </div>

                                            {isAttending && (
                                                <FormItem className="pt-2 border-t">
                                                    <div className="flex items-center gap-3">
                                                        <FormLabel className="text-xs">Number of Guests:</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={guestData.attendeeLimit > 0 ? guestData.attendeeLimit : undefined}
                                                                className="w-20 h-8 text-sm"
                                                                {...step2Form.register(`events.${index}.attendeeCount`, {
                                                                    valueAsNumber: true,
                                                                })}
                                                            />
                                                        </FormControl>
                                                        {guestData.attendeeLimit > 0 && (
                                                            <FormDescription className="text-xs m-0">
                                                                Max {guestData.attendeeLimit}
                                                            </FormDescription>
                                                        )}
                                                    </div>
                                                </FormItem>
                                            )}
                                        </div>
                                    );
                                })}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="w-full"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit RSVP"}
                                    </Button>
                                </div>
                            </form>
                        </FormProvider>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
