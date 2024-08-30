import type { ChainInfo } from './types'

enum RarimoChains {
  Mainnet = 'rarimo_201411-1',
  MainnetBeta = 'rarimo_42-1',
}

export const RARIMO_CHAINS: Record<string, ChainInfo> = {
  [RarimoChains.MainnetBeta]: {
    chainId: 'rarimo_42-1',
    chainName: 'Rarimo Testnet',
    chainSymbolImageUrl:
      'https://raw.githubusercontent.com/rarimo/js-sdk/2.0.0-rc.14/assets/logos/ra-dark-logo.png',
    rpc: 'https://rpc.node1.mainnet-beta.rarimo.com',
    rest: 'https://rpc-api.node1.mainnet-beta.rarimo.com',
    stakeCurrency: {
      coinDenom: 'STAKE',
      coinMinimalDenom: 'stake',
      coinDecimals: 6,
    },
    currencies: [
      {
        coinDenom: 'STAKE',
        coinMinimalDenom: 'stake',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'STAKE',
        coinMinimalDenom: 'stake',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0,
          average: 0.1,
          high: 0.5,
        },
      },
    ],
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'rarimo',
      bech32PrefixAccPub: 'rarimopub',
      bech32PrefixValAddr: 'rarimovaloper',
      bech32PrefixValPub: 'rarimovaloperpub',
      bech32PrefixConsAddr: 'rarimovalcons',
      bech32PrefixConsPub: 'rarimovalconspub',
    },
    beta: true,
    rpcEvm: 'https://rpc.evm.node1.mainnet-beta.rarimo.com',
  },
  [RarimoChains.Mainnet]: {
    chainId: 'rarimo_201411-1',
    chainName: 'Rarimo',
    chainSymbolImageUrl:
      'https://raw.githubusercontent.com/rarimo/js-sdk/2.0.0-rc.14/assets/logos/ra-dark-logo.png',
    rpc: 'https://rpc.mainnet.rarimo.com',
    rest: 'https://rpc-api.mainnet.rarimo.com',
    stakeCurrency: {
      coinDenom: 'RMO',
      coinMinimalDenom: 'urmo',
      coinDecimals: 6,
    },
    currencies: [
      {
        coinDenom: 'RMO',
        coinMinimalDenom: 'urmo',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'RMO',
        coinMinimalDenom: 'urmo',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0,
          average: 0.1,
          high: 0.5,
        },
      },
    ],
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'rarimo',
      bech32PrefixAccPub: 'rarimopub',
      bech32PrefixValAddr: 'rarimovaloper',
      bech32PrefixValPub: 'rarimovaloperpub',
      bech32PrefixConsAddr: 'rarimovalcons',
      bech32PrefixConsPub: 'rarimovalconspub',
    },
    beta: false,
    rpcEvm: 'https://rpc.evm.mainnet.rarimo.com',
  },
}
