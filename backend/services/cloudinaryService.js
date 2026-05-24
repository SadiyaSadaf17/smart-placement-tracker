import crypto from 'crypto';

const CLOUDINARY_UPLOAD_URL = (cloudName) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

const CLOUDINARY_DESTROY_URL = (cloudName) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

const getConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured');
  }

  return { cloudName, apiKey, apiSecret };
};

const signParams = (params, apiSecret) => {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
};

export const uploadImageToCloudinary = async ({ buffer, mimetype, publicId }) => {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_PROFILE_FOLDER || 'smart-placement-tracker/profiles';
  const params = { folder, public_id: publicId, timestamp, overwrite: true };
  const signature = signParams(params, apiSecret);

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimetype }));
  form.append('api_key', apiKey);
  form.append('signature', signature);
  Object.entries(params).forEach(([key, value]) => form.append(key, value));

  const response = await fetch(CLOUDINARY_UPLOAD_URL(cloudName), {
    method: 'POST',
    body: form,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Cloudinary upload failed');
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
  };
};

export const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return;

  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const signature = signParams(params, apiSecret);

  const form = new FormData();
  form.append('api_key', apiKey);
  form.append('signature', signature);
  Object.entries(params).forEach(([key, value]) => form.append(key, value));

  const response = await fetch(CLOUDINARY_DESTROY_URL(cloudName), {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error?.message || 'Cloudinary delete failed');
  }
};
