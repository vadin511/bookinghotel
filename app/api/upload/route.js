import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  const formData = await req.formData();
  const files = formData.getAll('photos'); // Lấy nhiều file từ key "photos"

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const uploadedFilenames = [];

  for (const file of files) {
    if (typeof file === 'string') continue;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${uuidv4()}_${file.name}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);
    uploadedFilenames.push(filename);
  }

  return NextResponse.json({ message: 'Files uploaded', files: uploadedFilenames });
}
