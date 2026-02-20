#!/usr/bin/env node

import fs from 'fs'
import https from 'https'

const TOKEN = 'sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3'
const PROJECT_ID = 'prnshbkblddfgttsgxpt'

async function deployFunction(functionName) {
  console.log(`\n📦 Deploying ${functionName}...`)

  const filePath = `./supabase/functions/${functionName}/index.ts`

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    return false
  }

  const sourceCode = fs.readFileSync(filePath, 'utf-8')

  return new Promise((resolve) => {
    const path = `/v1/projects/${PROJECT_ID}/functions/${functionName}/deploy`
    const url = new URL(`https://api.supabase.com${path}`)

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    }

    const req = https.request(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`)
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✅ ${functionName} deployed successfully`)
          resolve(true)
        } else {
          console.log(`Response: ${data}`)
          console.error(`❌ Failed to deploy ${functionName}`)
          resolve(false)
        }
      })
    })

    req.on('error', (error) => {
      console.error(`❌ Request error: ${error.message}`)
      resolve(false)
    })

    // Send file content as base64 or raw
    const payload = { body: sourceCode }
    req.write(JSON.stringify(payload))
    req.end()
  })
}

async function main() {
  console.log('🚀 Supabase Edge Functions Deployment')
  console.log(`📍 Project: ${PROJECT_ID}`)

  const functions = ['fetch-nuvemshop-orders', 'fetch-meta-campaigns']

  let deployed = 0
  for (const fn of functions) {
    const success = await deployFunction(fn)
    if (success) deployed++
  }

  console.log(`\n✨ Result: ${deployed}/${functions.length} functions`)
}

main()
