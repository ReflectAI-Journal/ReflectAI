import AppleAuth from 'apple-auth';

const config = {
  client_id: process.env.APPLE_CLIENT_ID || "auth.reflectai",
  team_id: process.env.APPLE_TEAM_ID || "ZP23Y9S5ZS",
  key_id: process.env.APPLE_KEY_ID || "T3F2X2F7AM",
  redirect_uri: 'https://reflectai-journal.site/auth/apple/callback',
  scope: 'name email',
};

const privateKey = process.env.APPLE_PRIVATE_KEY ? process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '';

const auth = new AppleAuth(config, privateKey, 'text');

export default auth;