

export async function GET() {
  await fetch(`${process.env.RENDER_API_URL}/health`).catch(() => {});
  return Response.json({ ok: true });
}