import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface ProgressBarProps {
    durationInFrames: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ durationInFrames }) => {
    const frame = useCurrentFrame();

    const width = interpolate(frame, [0, durationInFrames], [0, 100], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <div
            style={{
                width: '300px',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                marginTop: '20px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${width}%`,
                    backgroundColor: '#22D3EE',
                    boxShadow: '0 0 10px #22D3EE',
                }}
            />
        </div>
    );
};
