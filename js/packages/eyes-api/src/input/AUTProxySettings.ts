import {ProxySettings} from './ProxySettings'

export type AUTProxySettings = ProxySettings & {mode?: 'Allow' | 'Block'; domains?: string[]}
