import type { BnConfigLike, BnFormatConfig, BnLike } from '@distributedlab/tools'
import { BN, Time, time, type TimeDate } from '@distributedlab/tools'
import arDayjsLocal from 'dayjs/locale/ar'
import enDayjsLocal from 'dayjs/locale/en'
import ukDayjsLocal from 'dayjs/locale/uk'

import type { Language } from '@/core/localization/resources'

export const setDayjsLocale = (locale: Language) => {
  const nextLocale = {
    uk: ukDayjsLocal,
    en: enDayjsLocal,
    ar: arDayjsLocal,
  }[locale]

  Time.locale(nextLocale)
}

export function formatDateDMY(date: TimeDate) {
  return new Time(date).format('DD MMM YYYY')
}

export function formatDateDMYT(date: TimeDate) {
  return new Time(date).format('DD MMM YYYY HH:mm')
}

export function formatDateDiff(dateEnd: TimeDate) {
  return time(dateEnd).fromNow
}

// number
const defaultBnFormatConfig: BnFormatConfig = {
  decimals: 2,
  groupSeparator: ',',
  decimalSeparator: '.',
}

/**
 * Format human amount without trailing zeros
 * @param amount
 */
function removeTrailingZeros(amount: string) {
  const [integer, fraction] = amount.split('.')

  if (!fraction) return integer

  let result = integer

  for (let i = fraction.length - 1; i >= 0; i--) {
    if (fraction[i] !== '0') {
      result += `.${fraction.slice(0, i + 1)}`
      break
    }
  }

  return result
}

/**
 * Format human amount with prefix
 * @param value
 */
function convertNumberWithPrefix(value: string) {
  const M_PREFIX_AMOUNT = 1_000_000
  const B_PREFIX_AMOUNT = 1_000_000_000
  const T_PREFIX_AMOUNT = 1_000_000_000_000

  const getPrefix = (amount: number): 'M' | 'B' | 'T' | '' => {
    if (amount >= T_PREFIX_AMOUNT) return 'T'
    if (amount >= B_PREFIX_AMOUNT) return 'B'
    if (amount >= M_PREFIX_AMOUNT) return 'M'

    return ''
  }

  const prefix = getPrefix(+value)

  const divider = {
    M: M_PREFIX_AMOUNT,
    B: B_PREFIX_AMOUNT,
    T: T_PREFIX_AMOUNT,
    '': 1,
  }[prefix]

  const finalAmount = BN.fromRaw(Number(value) / divider, 3).format({
    decimals: 3,
    groupSeparator: '',
    decimalSeparator: '.',
  })

  return `${removeTrailingZeros(finalAmount)}${prefix}`
}

export function formatNumber(value: number, formatConfig?: BnFormatConfig) {
  try {
    const formatCfg = formatConfig || {
      ...defaultBnFormatConfig,
    }

    return removeTrailingZeros(BN.fromRaw(value).format(formatCfg))
  } catch (error) {
    return '0'
  }
}

export function formatAmount(
  amount: BnLike,
  decimalsOrConfig?: BnConfigLike,
  formatConfig?: BnFormatConfig,
) {
  try {
    const decimals =
      typeof decimalsOrConfig === 'number' ? decimalsOrConfig : decimalsOrConfig?.decimals

    const formatCfg = formatConfig || {
      ...defaultBnFormatConfig,
      ...(decimals && { decimals }),
    }

    if (Number(decimals) === 0) {
      const newAmount = BN.fromRaw(amount?.toString(), 18)

      return removeTrailingZeros(BN.fromBigInt(newAmount, 18).format(formatCfg))
    }

    return removeTrailingZeros(BN.fromBigInt(amount, decimalsOrConfig).format(formatCfg))
  } catch (error) {
    return '0'
  }
}

export function formatBalance(
  amount: BnLike,
  decimalsOrConfig?: BnConfigLike,
  formatConfig?: BnFormatConfig,
) {
  try {
    const decimals =
      typeof decimalsOrConfig === 'number' ? decimalsOrConfig : decimalsOrConfig?.decimals

    const formatCfg = formatConfig || {
      ...defaultBnFormatConfig,
      groupSeparator: '',
      ...(decimals && { decimals }),
    }

    return convertNumberWithPrefix(formatAmount(amount, decimalsOrConfig, formatCfg))
  } catch (error) {
    return '0'
  }
}
