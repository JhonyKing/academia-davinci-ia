import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

export const DataStreamVertical: React.FC = () => {
    const frame = useCurrentFrame();

    // Create columns of falling data
    const columns = new Array(10).fill(0).map((_, i) => i);

    return (
        <AbsoluteFill style={{ flexDirection: 'row', justifyContent: 'space-between', opacity: 0.3 }}>
            {columns.map((col) => {
                const speed = (random(`speed-${col}`) * 0.5) + 0.2;
                const offset = random(`offset-${col}`) * 1000;
                const y = ((frame * 10 * speed) + offset) % 2000;

                return (
                    <div key={col} style={{
                        position: 'relative',
                        width: '10%',
                        height: '100%',
                        overflow: 'hidden',
                        fontFamily: 'monospace',
                        fontSize: 14,
                        color: '#22D3EE',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: -1000,
                            transform: `translateY(${y}px)`
                        }}>
                            {new Array(50).fill(0).map((_, i) => (
                                <div key={i}>{random(`char-${col}-${i}`) > 0.5 ? '1' : '0'} 0x{Math.floor(random(`hex-${col}-${i}`) * 255).toString(16)}</div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </AbsoluteFill>
    );
};
