import { Time, time, type TimeDate } from '@distributedlab/tools'
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
