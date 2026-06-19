import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f131b',
          borderRadius: 6,
        }}
      >
        <div
          style={{
            width: 18,
            height: 4,
            background: '#f0b429',
            borderRadius: 2,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
