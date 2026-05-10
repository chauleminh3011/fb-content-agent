import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const infographic = body?.infographic;
    if (!infographic) {
      return new Response(JSON.stringify({ error: "infographic data required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { headline, subheadline, quote, items, footer, style } = infographic;

    const image = new ImageResponse(
      (
        <div
          style={{
            width: 1080,
            height: 1080,
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            padding: "64px",
            fontFamily: "Inter, sans-serif",
            position: "relative",
          }}
        >
          {/* Decorative accent line top */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #e94560, #0f3460)",
              display: "flex",
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "48px",
            }}
          >
            {/* Brand badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #e94560, #c0392b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#ffffff",
                }}
              >
                FB
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700 }}>
                  Content Pipeline
                </span>
                <span style={{ color: "#64748b", fontSize: "13px" }}>
                  facebook.com
                </span>
              </div>
            </div>
            {/* Format tag */}
            {style && (
              <div
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  background: "rgba(233, 69, 96, 0.15)",
                  border: "1px solid rgba(233, 69, 96, 0.3)",
                  color: "#e94560",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {style.toUpperCase()}
              </div>
            )}
          </div>

          {/* Quote style — for satire & life-observation */}
          {style === "quote" && quote && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              {/* Big quote */}
              <div
                style={{
                  borderLeft: "4px solid #e94560",
                  paddingLeft: "28px",
                  marginBottom: "40px",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    fontSize: "38px",
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: 1.3,
                    display: "flex",
                  }}
                >
                  {quote}
                </div>
              </div>
              {/* Headline */}
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#e94560",
                  marginBottom: "12px",
                  display: "flex",
                }}
              >
                {headline}
              </div>
              {subheadline && (
                <div
                  style={{
                    fontSize: "20px",
                    color: "#a8b2d8",
                    marginBottom: "32px",
                    display: "flex",
                  }}
                >
                  {subheadline}
                </div>
              )}
              {/* Items as observation points */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                {(items || []).slice(0, 4).map(
                  (item: { label: string; value: string; detail?: string }, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                        padding: "16px 20px",
                        background: "rgba(15, 52, 96, 0.4)",
                        border: "1px solid rgba(233, 69, 96, 0.15)",
                        borderRadius: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#e94560",
                          fontSize: "18px",
                          fontWeight: 800,
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600, display: "flex" }}>
                          {item.label}
                        </span>
                        {item.detail && (
                          <span style={{ color: "#a8b2d8", fontSize: "14px", marginTop: "3px", display: "flex" }}>
                            {item.detail}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Statement style — for POV */}
          {style === "statement" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  fontSize: "52px",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.15,
                  marginBottom: "20px",
                  display: "flex",
                }}
              >
                {headline}
              </div>
              {subheadline && (
                <div
                  style={{
                    fontSize: "22px",
                    color: "#e94560",
                    marginBottom: "40px",
                    fontWeight: 600,
                    display: "flex",
                  }}
                >
                  {subheadline}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
                {(items || []).slice(0, 3).map(
                  (item: { label: string; value: string; detail?: string }, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "20px 24px",
                        background: "rgba(15, 52, 96, 0.4)",
                        border: "1px solid rgba(233, 69, 96, 0.2)",
                        borderRadius: "14px",
                      }}
                    >
                      <span style={{ color: "#e94560", fontSize: "28px", fontWeight: 800, display: "flex" }}>
                        {item.value}
                      </span>
                      <span style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600, marginTop: "4px", display: "flex" }}>
                        {item.label}
                      </span>
                      {item.detail && (
                        <span style={{ color: "#a8b2d8", fontSize: "14px", marginTop: "4px", display: "flex" }}>
                          {item.detail}
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Grid/List/Steps style — for toplist, case-study, how-to */}
          {(style === "grid" || style === "list" || style === "steps" || (!style || !["quote", "statement"].includes(style))) && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  fontSize: "44px",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.2,
                  marginBottom: "12px",
                  display: "flex",
                }}
              >
                {headline}
              </div>
              {subheadline && (
                <div
                  style={{
                    fontSize: "20px",
                    color: "#a8b2d8",
                    marginBottom: "36px",
                    display: "flex",
                  }}
                >
                  {subheadline}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: style === "grid" ? "row" : "column",
                  flexWrap: style === "grid" ? "wrap" : "nowrap",
                  gap: "14px",
                  flex: 1,
                }}
              >
                {(items || []).slice(0, style === "grid" ? 6 : 5).map(
                  (item: { label: string; value: string; detail?: string }, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        background: "rgba(15, 52, 96, 0.4)",
                        border: "1px solid rgba(233, 69, 96, 0.2)",
                        borderRadius: "14px",
                        padding: "18px 22px",
                        width: style === "grid" ? "47%" : "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "6px",
                        }}
                      >
                        <span style={{ color: "#e94560", fontSize: "15px", fontWeight: 700 }}>
                          {style === "steps" ? `Bước ${i + 1}` : String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, display: "flex" }}>
                          {item.label}
                        </span>
                      </div>
                      <div style={{ color: "#e94560", fontSize: "16px", fontWeight: 700, display: "flex" }}>
                        {item.value}
                      </div>
                      {item.detail && (
                        <div style={{ color: "#a8b2d8", fontSize: "13px", marginTop: "4px", display: "flex" }}>
                          {item.detail}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          {footer && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "32px",
                paddingTop: "24px",
                borderTop: "1px solid rgba(233, 69, 96, 0.2)",
              }}
            >
              <span style={{ color: "#a8b2d8", fontSize: "17px" }}>{footer}</span>
              <span style={{ color: "#e94560", fontSize: "15px", fontWeight: 700 }}>
                #FacebookContent
              </span>
            </div>
          )}

          {/* Decorative accent line bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, #0f3460, #e94560)",
              display: "flex",
            }}
          />
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    );

    return image;
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "OG image failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
