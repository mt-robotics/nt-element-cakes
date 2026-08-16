export default async function handler(req, res) {
  // CLOUDINARY_URL = cloudinary://<api_key>:<api_secret>@<cloud_name>
  const raw = process.env.CLOUDINARY_URL;
  const m = raw?.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!m) {
    return res.status(500).json({ error: 'CLOUDINARY_URL is not set' });
  }
  const [, key, secret, cloud] = m;

  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  // List all uploads, then filter out Cloudinary's bundled "samples".
  const apiUrl =
    `https://api.cloudinary.com/v1_1/${cloud}/resources/image` +
    `?type=upload&max_results=500`;

  const upstream = await fetch(apiUrl, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!upstream.ok) {
    return res.status(upstream.status).json({ error: 'Cloudinary API request failed' });
  }
  const data = await upstream.json();

  // Exclude Cloudinary's bundled "samples" folder (demo content every new
  // account ships with). Everything else is the owner's cake photos.
  const images = (data.resources || [])
    .filter((img) => !img.public_id.startsWith('samples/'))
    .map((img) => ({
      id: img.public_id,
      thumb: `https://res.cloudinary.com/${cloud}/image/upload/c_scale,w_400,q_auto/${img.public_id}`,
      full: img.secure_url,
    }));

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600');
  res.status(200).json(images);
}
