import { NextRequest } from "next/server";
import { ExportService } from "@/lib/services/export.service";
import { validateBody } from "@/lib/middleware/validate";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { exportSchema } from "@cardkeeper/shared-utils";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticate(req);
  const body = await validateBody(req, exportSchema);
  const vcard = await ExportService.exportVCard(auth.userId, body);

  return new Response(vcard, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="cardkeeper_${new Date().toISOString().split("T")[0]}.vcf"`,
    },
  });
});
