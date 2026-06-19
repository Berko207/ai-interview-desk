import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AI Interview Desk — Mock-interview coach + profile optimizer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0f131b',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: 72,
            height: 6,
            background: '#f0b429',
            borderRadius: 3,
            marginBottom: 40,
          }}
        />
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#e9ecf2',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          AI Interview Desk
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#8b94a6',
            lineHeight: 1.4,
            maxWidth: 800,
          }}
        >
          Mock-interview coach + profile optimizer
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            right: 80,
            fontSize: 20,
            color: '#f0b429',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          Mercor · Outlier · Mindrift · Alignerr
        </div>
      </div>
    ),
    { ...size }
  );
}
