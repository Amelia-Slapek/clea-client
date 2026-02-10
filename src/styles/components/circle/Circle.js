import React from "react";

const CircleProgress = ({ current, total, size = 100, strokeWidth = 12, color = "#4caf50" }) => {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const percent = (current / total) * 100;
    const offset = circumference * (1 - percent / 100);

    return (
        <svg width={size} height={size}>
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#eee"
                strokeWidth={strokeWidth}
            />
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference - offset} ${circumference}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
            />
            <text className="circle-text"
                x={center}
                y={center}
                textAnchor="middle"
                dominantBaseline="middle"
            >
                {current}
            </text>
        </svg>
    );
};

export default CircleProgress;
