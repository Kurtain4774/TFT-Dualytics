export function normalizeCompSearch(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function byId(rows) {
  return new Map((rows || []).map(row => [row.id, row]))
}

function compactLabels(labels) {
  return labels.filter(Boolean).map(normalizeCompSearch).filter(Boolean)
}

export function buildCompSearchText(comp, champions = [], traits = []) {
  const championById = byId(champions)
  const traitById = byId(traits)

  const unitLabels = (comp.units || []).flatMap(unit => {
    const champion = championById.get(unit.id)
    return compactLabels([
      unit.id,
      champion?.id,
      champion?.apiName,
      champion?.name,
    ])
  })

  const traitLabels = (comp.traits || []).flatMap(trait => {
    const meta = traitById.get(trait.id)
    return compactLabels([
      trait.id,
      meta?.id,
      meta?.apiName,
      meta?.name,
    ])
  })

  return [...unitLabels, ...traitLabels].join(' ')
}

export function filterComps(comps, champions, traits, query) {
  const terms = normalizeCompSearch(query).split(' ').filter(Boolean)
  if (terms.length === 0) return comps

  return (comps || []).filter(comp => {
    const searchText = buildCompSearchText(comp, champions, traits)
    return terms.every(term => searchText.includes(term))
  })
}
