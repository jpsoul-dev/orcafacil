import Hashids from 'hashids'

const SALT = 'orca-facil-salt-2026'
const MIN_LENGTH = 6
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const hashids = new Hashids(SALT, MIN_LENGTH, ALPHABET)

export const encodeId = (id: number) => hashids.encode(id)
export const decodeId = (hash: string) => hashids.decode(hash)[0] as number

export const generateRandomHash = () => {
  const chars = ALPHABET
  const bytes = new Uint8Array(MIN_LENGTH)
  crypto.getRandomValues(bytes)
  let result = ''
  for (let i = 0; i < MIN_LENGTH; i++) {
    result += chars.charAt(bytes[i] % chars.length)
  }
  return result
}
