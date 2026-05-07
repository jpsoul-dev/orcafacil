require('dotenv').config({ path: '.env.local' })
import { setupNewUser } from './lib/services/user-service'

async function run() {
  console.log('Testing setupNewUser...')
  const result = await setupNewUser('6ce32b44-481c-4653-bec5-bb93e250db07', 'jp.guitarrock@gmail.com')
  console.log('Result:', result)
}

run()
