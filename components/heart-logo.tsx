interface HeartLogoProps {
    groomInitial: string;
    brideInitial: string;
    className?: string;
}

export function HeartLogo({ groomInitial, brideInitial, className = "" }: HeartLogoProps) {
    return (
        <svg
            viewBox="0 0 200 200"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Gradient definitions */}
            <defs>
                <linearGradient id="groomGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#60a5fa", stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="brideGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: "#ec4899", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#f472b6", stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#ec4899", stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: "#db2777", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
                </linearGradient>
            </defs>

            {/* Heart shape in center - smaller and centered */}
            <path
                d="M100,130 C100,130 65,95 65,75 C65,62 73,52 85,52 C92,52 97,56 100,63 C103,56 108,52 115,52 C127,52 135,62 135,75 C135,95 100,130 100,130 Z"
                fill="url(#heartGradient)"
                opacity="0.85"
            />

            {/* Groom's initial (left) - more spacing */}
            <text
                x="35"
                y="95"
                fontSize="42"
                fontWeight="bold"
                fill="url(#groomGradient)"
                fontFamily="Arial, sans-serif"
                textAnchor="middle"
            >
                {groomInitial.toUpperCase()}
            </text>

            {/* Bride's initial (right) - more spacing */}
            <text
                x="165"
                y="95"
                fontSize="42"
                fontWeight="bold"
                fill="url(#brideGradient)"
                fontFamily="Arial, sans-serif"
                textAnchor="middle"
            >
                {brideInitial.toUpperCase()}
            </text>

            {/* Decorative sparkles */}
            <circle cx="100" cy="45" r="2.5" fill="#fbbf24" opacity="0.8" />
            <circle cx="88" cy="42" r="1.5" fill="#fbbf24" opacity="0.6" />
            <circle cx="112" cy="42" r="1.5" fill="#fbbf24" opacity="0.6" />
        </svg>
    );
}
