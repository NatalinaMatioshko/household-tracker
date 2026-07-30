import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#D4E7E4",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 22,
              background: "#1A1A1A",
              borderRadius: 8,
              marginBottom: 6,
            }}
          />
          <div
            style={{
              width: 78,
              height: 100,
              background: "#1A1A1A",
              borderRadius: "14px 14px 22px 22px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 12,
            }}
          >
            <div
              style={{
                width: 46,
                height: 62,
                background: "#70D9BD",
                borderRadius: "10px 10px 16px 16px",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
