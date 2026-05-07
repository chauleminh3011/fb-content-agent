import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * POST /api/fb-publish
 *
 * Đăng bài text (+ optional ảnh đã upload sẵn) lên Facebook Page
 * thông qua Graph API v25.0.
 *
 * Body:
 *  - message: string          — nội dung bài viết
 *  - pageId?: string          — Facebook Page ID
 *  - pageToken?: string       — Page Access Token
 *  - photoUrl?: string        — URL ảnh công khai để đính kèm (optional)
 *  - scheduledTime?: number   — UNIX timestamp để lên lịch (optional, tối thiểu +10 phút)
 *
 * Server env FB_PAGE_ID/FB_PAGE_ACCESS_TOKEN chỉ được dùng khi request gửi
 * header x-admin-secret khớp FB_PUBLISH_ADMIN_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      pageId,
      pageToken,
      photoUrl,
      scheduledTime,
    } = body as {
      message: string;
      pageId?: string;
      pageToken?: string;
      photoUrl?: string;
      scheduledTime?: number;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const adminSecret = process.env.FB_PUBLISH_ADMIN_SECRET;
    const requestSecret = req.headers.get("x-admin-secret");
    const canUseServerCredentials =
      !!adminSecret && requestSecret === adminSecret;

    const resolvedPageId = pageId || (canUseServerCredentials ? process.env.FB_PAGE_ID : undefined);
    const resolvedToken = pageToken || (canUseServerCredentials ? process.env.FB_PAGE_ACCESS_TOKEN : undefined);

    if (!resolvedPageId) {
      return NextResponse.json(
        { error: "Facebook Page ID is required. Pass pageId in request, or send x-admin-secret to use server credentials." },
        { status: 400 }
      );
    }
    if (!resolvedToken) {
      return NextResponse.json(
        { error: "Facebook Page Access Token is required. Pass pageToken in request, or send x-admin-secret to use server credentials." },
        { status: 400 }
      );
    }

    const apiBase = "https://graph.facebook.com/v25.0";

    // Case 1: Có ảnh → upload photo rồi post kèm caption
    if (photoUrl) {
      // Step A: Upload ảnh lên Facebook (url upload)
      const uploadParams = new URLSearchParams({
        url: photoUrl,
        caption: message,
        published: scheduledTime ? "false" : "true",
        access_token: resolvedToken,
      });
      if (scheduledTime) {
        uploadParams.set("scheduled_publish_time", String(scheduledTime));
      }

      const uploadRes = await fetch(`${apiBase}/${resolvedPageId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: uploadParams.toString(),
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || uploadData.error) {
        return NextResponse.json(
          {
            error: uploadData.error?.message || "Failed to upload photo to Facebook",
            details: uploadData,
          },
          { status: uploadRes.status || 500 }
        );
      }

      return NextResponse.json({
        success: true,
        type: "photo_post",
        postId: uploadData.post_id || uploadData.id,
        photoId: uploadData.id,
        scheduled: !!scheduledTime,
        url: uploadData.post_id
          ? `https://www.facebook.com/${uploadData.post_id}`
          : undefined,
      });
    }

    // Case 2: Text only → post lên /{page-id}/feed
    const feedParams: Record<string, string> = {
      message,
      access_token: resolvedToken,
    };
    if (scheduledTime) {
      feedParams.published = "false";
      feedParams.scheduled_publish_time = String(scheduledTime);
    }

    const feedRes = await fetch(`${apiBase}/${resolvedPageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedParams),
    });
    const feedData = await feedRes.json();

    if (!feedRes.ok || feedData.error) {
      return NextResponse.json(
        {
          error: feedData.error?.message || "Failed to publish to Facebook",
          code: feedData.error?.code,
          details: feedData,
        },
        { status: feedRes.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      type: "text_post",
      postId: feedData.id,
      scheduled: !!scheduledTime,
      url: feedData.id ? `https://www.facebook.com/${feedData.id}` : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publish failed" },
      { status: 500 }
    );
  }
}
