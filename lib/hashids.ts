import Hashids from 'hashids'

const SALT = 'orca-facil-salt-2026'
const MIN_LENGTH = 6
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

const hashids = new Hashids(SALT, MIN_LENGTH, ALPHABET)

export const encodeId = (id: number) => hashids.encode(id)
export const decodeId = (hash: string) => hashids.decode(hash)[0] as number

export const generateRandomHash = () => {
  const chars = ALPHABET
  let result = ''
  for (let i = 0; i < MIN_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
