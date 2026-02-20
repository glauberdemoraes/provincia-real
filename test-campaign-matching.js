/**
 * Teste para validar matching de campanhas
 * Execute: node test-campaign-matching.js
 */

// Simular as funções de matching
const cleanUtmValue = (raw) => {
  try {
    return decodeURIComponent(raw).split('|')[0].trim()
  } catch {
    return raw.split('|')[0].trim()
  }
}

const normalizeCampaignName = (name) => {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
}

// Testes
console.log('╔════════════════════════════════════════════╗')
console.log('║   TESTE DE MATCHING DE CAMPANHAS          ║')
console.log('╚════════════════════════════════════════════╝\n')

const testCases = [
  {
    name: 'Normal match',
    utm: 'Doce de Leite',
    meta: 'Doce de Leite',
    shouldMatch: true,
  },
  {
    name: 'Case mismatch',
    utm: 'DOCE DE LEITE',
    meta: 'doce de leite',
    shouldMatch: true,
  },
  {
    name: 'UTM com ID após pipe',
    utm: 'Doce de Leite|423423',
    meta: 'Doce de Leite',
    shouldMatch: true,
  },
  {
    name: 'UTM URL-encoded com pipe',
    utm: 'Doce%20de%20Leite%7C423423',
    meta: 'Doce de Leite',
    shouldMatch: true,
  },
  {
    name: 'Acentos',
    utm: 'Açúcar Cristal',
    meta: 'Acucar Cristal',
    shouldMatch: true,
  },
  {
    name: 'Espaços extras',
    utm: 'Doce  de   Leite',
    meta: 'Doce de Leite',
    shouldMatch: true,
  },
  {
    name: 'Vazio UTM',
    utm: '',
    meta: 'Doce de Leite',
    shouldMatch: false,
  },
  {
    name: 'Null UTM',
    utm: null,
    meta: 'Doce de Leite',
    shouldMatch: false,
  },
  {
    name: 'Hífen vs espaço',
    utm: 'doce-de-leite',
    meta: 'Doce de Leite',
    shouldMatch: false, // Isso é um problema!
  },
]

let passed = 0
let failed = 0

testCases.forEach((test, i) => {
  const utmCleaned = cleanUtmValue(test.utm || 'Direto')
  const utmNorm = normalizeCampaignName(utmCleaned)
  const metaNorm = normalizeCampaignName(test.meta)

  const matches = utmNorm === metaNorm
  const isCorrect = matches === test.shouldMatch

  const status = isCorrect ? '✅' : '❌'
  const result = matches ? 'MATCH' : 'NO MATCH'

  console.log(`${status} Teste ${i + 1}: ${test.name}`)
  console.log(`   UTM input:      "${test.utm}"`)
  console.log(`   UTM cleaned:    "${utmCleaned}"`)
  console.log(`   UTM normalized: "${utmNorm}"`)
  console.log(`   Meta normalized: "${metaNorm}"`)
  console.log(`   Result:         ${result} (esperado: ${test.shouldMatch ? 'MATCH' : 'NO MATCH'})`)
  console.log()

  if (isCorrect) {
    passed++
  } else {
    failed++
  }
})

console.log('╔════════════════════════════════════════════╗')
console.log(`║   RESULTADO: ${passed} passou, ${failed} falhou`)
console.log('╚════════════════════════════════════════════╝\n')

if (failed > 0) {
  console.log('⚠️  PROBLEMAS ENCONTRADOS:')
  console.log('1. Hífen (-) vs espaço: "doce-de-leite" NÃO matcheia "Doce de Leite"')
  console.log('2. Solução: Adicionar replace(/[-_]+/g, "") na normalizeCampaignName')
  console.log()
  console.log('Sugestão de fix:')
  console.log(`
const normalizeCampaignName = (name) => {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')   // Acentos
    .replace(/[-_]+/g, '')                // Hífens e underscores
    .replace(/\\s+/g, '')                 // Espaços
}
  `)
}
