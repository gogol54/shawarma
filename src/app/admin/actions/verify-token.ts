'use server'

import jwt from 'jsonwebtoken'

type TokenPayload = {
  email: string
  iat: number
  exp: number
}

export async function verifyToken(token: string): Promise<
  { valid: true; payload: TokenPayload } | { valid: false; error: string }
> {
  if (!token) {
    return {
      valid: false,
      error: 'Token não fornecido',
    }
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    return {
      valid: true,
      payload,
    }
  } catch (err) {
    return {
      valid: false,
      error: 'Token inválido ou expirado' + err,
    }
  }
}
