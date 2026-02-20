#!/usr/bin/env node

import fs from 'fs'
import https from 'https'

const TOKEN = 'sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3'
const PROJECT_ID = 'prnshbkblddfgttsgxpt'
const SUPABASE_API_URL = 'https://api.supabase.com'

async function fetchAPI(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_API_URL + path)
    const options = {
      method,
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
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          })
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          })
        }
      })
    })

    req.on('error', reject)

    if (body) {
      req.write(JSON.stringify(body))
    }
    req.end()
  })
}

async function deployFunction(functionName) {
  console.log(`\n📦 Deploying ${functionName}...`)

  const filePath = `./supabase/functions/${functionName}/index.ts`

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    return false
  }

  const sourceCode = fs.readFileSync(filePath, 'utf-8')

  try {
    const response = await fetchAPI(
      'POST',
      `/v1/projects/${PROJECT_ID}/functions`,
      {
        name: functionName,
        import_map: '',
        verify_jwt: true,
      }
    )

    if (response.status === 201 || response.status === 200) {
      console.log(`✅ ${functionName} function created/updated`)

      // Update the function code
      const updateResponse = await fetchAPI(
        'PUT',
        `/v1/projects/${PROJECT_ID}/functions/${functionName}`,
        {
          name: functionName,
          body: sourceCode,
        }
      )

      if (updateResponse.status === 200) {
        console.log(`✅ ${functionName} code deployed`)
        return true
      } else {
        console.error(`❌ Failed to deploy code:`, updateResponse.data)
        return false
      }
    } else if (response.status === 409) {
      console.log(`ℹ️  ${functionName} already exists, updating...`)

      const updateResponse = await fetchAPI(
        'PUT',
        `/v1/projects/${PROJECT_ID}/functions/${functionName}`,
        {
          body: sourceCode,
        }
      )

      if (updateResponse.status === 200) {
        console.log(`✅ ${functionName} updated`)
        return true
      } else {
        console.error(`❌ Failed to update:`, updateResponse.data)
        return false
      }
    } else {
      console.error(`❌ API Error (${response.status}):`, response.data)
      return false
    }
  } catch (error) {
    console.error(`❌ Error deploying ${functionName}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Edge Functions Deployment')
  console.log(`📍 Project: ${PROJECT_ID}`)
  console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`)

  const functions = ['fetch-nuvemshop-orders', 'fetch-meta-campaigns']

  let deployed = 0
  for (const fn of functions) {
    const success = await deployFunction(fn)
    if (success) deployed++
  }

  console.log(`\n📊 Result: ${deployed}/${functions.length} functions deployed`)

  if (deployed === functions.length) {
    console.log('✅ All edge functions deployed successfully!')
    console.log('\n🌐 Functions available at:')
    console.log(`  https://${PROJECT_ID}.supabase.co/functions/v1/fetch-nuvemshop-orders`)
    console.log(`  https://${PROJECT_ID}.supabase.co/functions/v1/fetch-meta-campaigns`)
  } else {
    console.log('⚠️  Some functions failed to deploy')
  }
}

main().catch(console.error)
