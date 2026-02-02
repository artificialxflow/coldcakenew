import bcrypt from "bcryptjs";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

export function hashValue(value: string) {
  return bcrypt.hash(value, SALT_ROUNDS);
}

export function compareHash(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}


