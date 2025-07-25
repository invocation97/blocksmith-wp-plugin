import { z } from "zod";

export const blockSchema = z.object({
  blockContent: z.string(),
});

export type BlockContent = z.infer<typeof blockSchema>;
