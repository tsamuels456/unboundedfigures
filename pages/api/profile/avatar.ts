// pages/api/profile/avatar.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { formidable } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uploadDir = path.join(process.cwd(), "/public/avatars");

  // ensure directory exists
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 5 * 1024 * 1024, // 5 MB
  });

  try {
    const [fields, files] = await form.parse(req);

    const file = files.avatar?.[0];
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const filename = path.basename(file.filepath);
    const publicPath = `/avatars/${filename}`;

    return res.status(200).json({ url: publicPath });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Avatar upload failed" });
  }
}
