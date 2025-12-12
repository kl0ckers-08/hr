import fs from "fs";
import path from "path";

export async function saveFile(file: File, folder: string = "uploads") {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", folder);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    return `/public/${folder}/${uniqueName}`;
}
