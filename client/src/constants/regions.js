export const REGIONS = ['na', 'euw', 'eune', 'kr', 'jp', 'br', 'lan', 'las', 'oce', 'tr', 'ru', 'vn', 'tw', 'sea', 'me']

export const LEADERBOARD_REGION_OPTIONS = [
  'na',
  'euw',
  'eune',
  'kr',
  'jp',
  'oce',
  'br',
  'lan',
  'las',
  'tr',
  'ru',
  'vn',
  'tw',
  'sea',
  'me',
].map(code => ({
  code,
  label: code.toUpperCase(),
}))

export const REGION_DEFAULT_TAG = {
  na: 'NA1', na1: 'NA1',
  euw: 'EUW1', euw1: 'EUW1',
  eune: 'EUN1', eun1: 'EUN1',
  kr: 'KR',
  jp: 'JP1', jp1: 'JP1',
  br: 'BR1', br1: 'BR1',
  lan: 'LA1', la1: 'LA1',
  las: 'LA2', la2: 'LA2',
  oce: 'OC1', oc1: 'OC1',
  tr: 'TR1', tr1: 'TR1',
  ru: 'RU',
  vn: 'VN2', vn2: 'VN2',
  tw: 'TW2', tw2: 'TW2',
  sea: 'SG2', sg2: 'SG2',
  me: 'ME1', me1: 'ME1',
}

export const REGION_CANONICAL_BY_ALIAS = {
  na1: 'na',
  euw1: 'euw',
  eun1: 'eune',
  jp1: 'jp',
  br1: 'br',
  la1: 'lan',
  la2: 'las',
  oc1: 'oce',
  tr1: 'tr',
  vn2: 'vn',
  tw2: 'tw',
  sg2: 'sea',
  me1: 'me',
}
