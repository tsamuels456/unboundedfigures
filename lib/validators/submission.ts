import { z } from "zod";

// You can tweak these to your taste.
export const SubmissionCreateSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().max(20_000).optional(),          // longform text / LaTeX
  fileUrl: z.string().url().optional(),                 // where an uploaded file will live (later)
  tags: z.array(z.string().min(1).max(24)).max(12).optional(),
  aiNote: z.string().max(2000).optional(),              // “AI assistance disclosure”
  category: z.enum(["unbounded-space","library-of-figures","project-lab"]).default("unbounded-space"),
  visibility: z.enum(["PUBLIC","PRIVATE"]).default("PUBLIC"),
  allowComments: z.boolean().default(true),
  // Temporary: authorId will come from auth later; for now allow override or use DEV_SEED_USER_ID
  authorId: z.string().cuid().optional(),
});

// Optional helper type
export type SubmissionCreateInput = z.infer<typeof SubmissionCreateSchema>;
