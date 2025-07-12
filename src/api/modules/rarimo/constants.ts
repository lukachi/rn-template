import type { ChainInfo } from './types'

enum RarimoChains {
  Mainnet = '7368',
  MainnetBeta = '201411',
}

export const RARIMO_CHAINS: Record<string, ChainInfo> = {
  [RarimoChains.MainnetBeta]: {
    chainId: '201411',
    chainName: 'Rarimo Mainnet Beta',
    chainSymbolImageUrl:
      'https://raw.githubusercontent.com/rarimo/js-sdk/2.0.0-rc.14/assets/logos/ra-dark-logo.png',
    rpcEvm: 'https://rpc.evm.mainnet.rarimo.com',
    explorerUrl: 'https://evmscan.rarimo.com',
  },
  [RarimoChains.Mainnet]: {
    chainId: '7368',
    chainName: 'Rarimo Mainnet',
    chainSymbolImageUrl:
      'https://raw.githubusercontent.com/rarimo/js-sdk/2.0.0-rc.14/assets/logos/ra-dark-logo.png',

    rpcEvm: 'https://l2.rarimo.com',
    explorerUrl: 'https://scan.rarimo.com',
  },
}
