export function resolveUnits(units, champions, items) {
  return (units || []).map(u => ({
    ...u,
    champion: champions?.find(c => c.id === u.id) || { id: u.id, name: u.id, cost: 1, iconUrl: '', traits: [] },
    resolvedItems: (u.items || []).map(itemApiName =>
      items?.find(i => i.apiName === itemApiName || i.id === itemApiName) || null
    ),
  }))
}
