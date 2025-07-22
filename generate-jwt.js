import fs from 'fs';
import jwt from 'jsonwebtoken';

const privateKey = fs.readFileSync('./AuthKey_T3FX2F7AM.p8');

const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d',
  issuer: 'ZP23Y95ZSZ',          // ← Your Apple Team ID
  audience: 'https://appleid.apple.com',
  subject: 'auth.reflectai',     // ← Your Client ID (Service ID)
  keyid: 'T3FX2F7AM'             // ← Your Apple Key ID
});

console.log('Apple OAuth Secret (JWT):\n', token);