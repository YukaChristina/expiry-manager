import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ fontSize: 90, lineHeight: 1 }}>🫙</div>
        <div style={{ fontSize: 22, color: 'white', fontWeight: 'bold', letterSpacing: -0.5 }}>蔵出し</div>
      </div>
    ),
    { ...size }
  )
}
