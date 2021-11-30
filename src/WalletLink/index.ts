/**
 * [[include:WalletLink.md]]
 * @packageDocumentation
 * @module WalletLink
 */

import { Buffer } from 'buffer'
import queryString from 'query-string'
import { Platform } from 'react-native'

export type LinkWalletRequest = {
  requestAppId: string
  callbackUrl: string
  appName: string
}

export type Token = LinkWalletRequest & {
  signingAppId: string
  time: number
  address: string
  signature: string
}

export type LinkWalletResponse = {
  status: 'success' | 'user_cancelled'
  token?: string
}

export type SignHotspotRequest = {
  token: string
  addGatewayTxn?: string
  assertLocationTxn?: string
}

export type SignHotspotResponse = {
  status: 'success' | 'token_not_found' | 'user_cancelled' | 'gateway_not_found'
  assertTxn?: string
  gatewayTxn?: string
}

export type MakerApp = {
  universalLink: string
  name: string
  androidPackage: string
  iosBundleId: string
}

export type DelegateApp = {
  urlScheme: string
  universalLink: string
  name: string
  androidPackage: string
  iosBundleId: string
  appStoreId: number
}

const heliumHotspotApp: DelegateApp = {
  urlScheme: 'helium://',
  universalLink: 'https://helium.com/',
  name: 'helium-hotspot',
  androidPackage: 'com.helium.wallet',
  iosBundleId: 'com.helium.mobile.wallet',
  appStoreId: 1450463605,
}

export const delegateApps = [heliumHotspotApp]

export const parseWalletLinkToken = (base64Token: string) => {
  const buff = Buffer.from(base64Token, 'base64')
  const container = buff.toString('utf-8')
  return JSON.parse(container) as Token
}

/**
 *Request a token from your app to an app capable of signing a transaction (e.g. Helium Hotspot).
 * @param opts
 * @param opts.requestAppId the bundleId of the app requesting a token. Use `import { getBundleId } from 'react-native-device-info'`
 * @param opts.callbackUrl the url used to deeplink back to the requesting app
 * @param opts.appName the name of the app requesting a link
 * @param opts.universalLink the deeplink url of the app that will be creating the link (e.g. https://helium.com/)
 */
export const createWalletLinkUrl = (opts: {
  requestAppId: string
  callbackUrl: string
  appName: string
  universalLink: string
}) => {
  const { universalLink, ...params } = opts
  const query = queryString.stringify(params)

  return `${universalLink}link_wallet?${query}`
}
export const createUpdateHotspotUrl = (opts: SignHotspotRequest) => {
  const { signingAppId } = parseWalletLinkToken(opts.token) || {
    signingAppId: '',
  }
  const requestApp = delegateApps.find(({ androidPackage, iosBundleId }) => {
    const id = Platform.OS === 'android' ? androidPackage : iosBundleId
    return id === signingAppId
  })
  const universalLink = requestApp?.universalLink
  if (!universalLink) return
  const query = queryString.stringify(opts)
  return `${universalLink}sign_hotspot?${query}`
}

export const createSignHotspotCallbackUrl = (
  makerAppLink: string,
  responseParams: SignHotspotResponse
) => `${makerAppLink}sign_hotspot?${queryString.stringify(responseParams)}`

export const createLinkWalletCallbackUrl = (
  makerAppLink: string,
  address: string,
  responseParams: SignHotspotResponse
) =>
  `${makerAppLink}link_wallet/${address}?${queryString.stringify(
    responseParams
  )}`
