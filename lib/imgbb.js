export async function uploadImageToImgbb(file) {
  const imgbbApiKey = process.env.IMGBB_API_KEY;

  if (!imgbbApiKey) {
    throw new Error("IMGBB_API_KEY is not defined.");
  }

  const base64 = file.buffer.toString("base64");

  const form = new FormData();
  form.append("key", imgbbApiKey);
  form.append("image", base64);
  form.append("name", file.originalname);

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error(`ImgBB upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(`ImgBB upload failed: ${data.error?.message}`);
  }
  const payload = {
    filename: data.data.image.filename,
    originalName: file.originalname,
    url: data.data.url,
    displayUrl: data.data.display_url,
    deleteUrl: data.data.delete_url,
    type: "image",
    mimeType: file.mimetype,
    size: file.size,
    isImage: true,
  };
  return payload;
}
