import { Address, Keypair, Mnemonic } from '@helium/crypto-react-native'
import wordlist from './Wordlists/english.json'

/**
 * A libsodium keypair.
 */
export interface SodiumKeyPair {
  sk: string
  pk: string
}

/**
 * Creates a keypair from the provided {@link Mnemonic}, or from a newly generated one.
 * @param givenMnemonic list of bip39 words to create the keypair with
 */
export const createKeypair = async (
  givenMnemonic: Mnemonic | Array<string> | null = null
) => {
  let mnemonic: Mnemonic
  if (!givenMnemonic) {
    mnemonic = await Mnemonic.create()
  } else if ('words' in givenMnemonic) {
    mnemonic = givenMnemonic
  } else {
    mnemonic = new Mnemonic(givenMnemonic)
  }
  const { keypair, address } = await Keypair.fromMnemonic(mnemonic)
  const keypairRaw = keypair as SodiumKeyPair
  return { keypairRaw, address, mnemonic }
}

/**
 * Get an {@link Address} from a b58 string.
 * @param addressB58
 */
export const getAddress = async (addressB58: string): Promise<Address> =>
  Address.fromB58(addressB58)

/**
 * Get a {@link Mnemonic} from a list of bip39 words.
 * @param words
 */
export const getMnemonic = async (words: string[]) => new Mnemonic(words)

/**
 * Get a {@link Keypair} from a {@link SodiumKeyPair}
 * @param keypairRaw
 */
export const getKeypair = (keypairRaw: SodiumKeyPair): Keypair =>
  new Keypair(keypairRaw)

/**
 * Get the list of bip39 words that match a given substring.
 * @param text
 */
export const getMatchingWords = (text: string) =>
  wordlist.filter((word) => word.indexOf(text.toLocaleLowerCase()) === 0)
