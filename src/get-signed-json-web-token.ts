import jsonwebtoken from "jsonwebtoken";

interface getSignedJWTOptions {
  id: number;
  privateKey: string;
}

export function getSignedJsonWebToken({ id, privateKey }: getSignedJWTOptions) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now, // Issued at time
    exp: now + 60 * 10, // JWT expiration time (10 minute maximum)
    iss: id
  };
  const token = jsonwebtoken.sign(payload, privateKey, { algorithm: "RS256" });
  return token;
}
