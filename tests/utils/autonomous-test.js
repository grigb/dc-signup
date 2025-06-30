// Test what we can do autonomously with current permissions
const { createClient } = require('@supabase/supabase-js')

// SECURITY: JWT key compromised - replaced with placeholder
const supabaseUrl = process.env.SUPABASE_URL || 'https://jgnyutkpxapaghderjmj.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'REPLACE_WITH_NEW_SECURE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAutonomousCapabilities() {
  console.log('🤖 Testing autonomous capabilities...')
  
  // Test 1: Can we read existing tables?
  console.log('\n1. Testing table access...')
  try {
    const { data: tables, error } = await supabase
      .from('signups')
      .select('count(*)', { count: 'exact', head: true })
    
    if (error) {
      console.log('❌ Signups table not accessible:', error.message)
      console.log('   → Need manual SQL execution')
    } else {
      console.log('✅ Signups table accessible')
      console.log(`   → Current records: ${tables}`)
      
      // Test 2: Can we insert data?
      console.log('\n2. Testing data insertion...')
      const testRecord = {
        name: 'Autonomous Test',
        email: `auto-test-${Date.now()}@example.com`,
        creator_types: ['technical-creation'],
        device_id: 'autonomous-test',
        referral_source: 'autonomous-test'
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('signups')
        .insert([testRecord])
        .select()
      
      if (insertError) {
        console.log('❌ Cannot insert data:', insertError.message)
        if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
          console.log('   → Missing privacy columns - need COMPLETE-SETUP.sql')
        }
      } else {
        console.log('✅ Can insert data autonomously')
        console.log(`   → Created record: ${insertData[0]?.id}`)
      }
    }
  } catch (error) {
    console.log('❌ Database connection failed:', error.message)
  }
  
  // Test 3: Can we access creator_types?
  console.log('\n3. Testing creator_types table...')
  try {
    const { data: creatorData, error: creatorError } = await supabase
      .from('creator_types')
      .select('*')
      .limit(5)
    
    if (creatorError) {
      console.log('❌ Creator types table not accessible:', creatorError.message)
      console.log('   → Need to run CREATOR-TYPES-SCHEMA.sql')
    } else {
      console.log('✅ Creator types table accessible')
      console.log(`   → Found ${creatorData?.length || 0} categories`)
      
      // Test 4: Can we call the JSON function?
      console.log('\n4. Testing creator types function...')
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_creator_types_json')
      
      if (functionError) {
        console.log('❌ Creator types function not available:', functionError.message)
        console.log('   → Need to run database function creation')
      } else {
        console.log('✅ Creator types function working autonomously')
        console.log(`   → Loaded ${functionData?.creatorTypes?.length || 0} categories`)
      }
    }
  } catch (error) {
    console.log('❌ Creator types access failed:', error.message)
  }
  
  // Summary
  console.log('\n🎯 AUTONOMOUS CAPABILITY SUMMARY:')
  console.log('=' * 40)
  console.log('✅ CAN DO: Code generation, testing, documentation')
  console.log('✅ CAN DO: Read operations (if tables exist)')
  console.log('✅ CAN DO: Insert data (if schema exists)')
  console.log('✅ CAN DO: Deploy static sites')
  console.log('❌ CANNOT DO: Create database tables/functions')
  console.log('❌ CANNOT DO: Modify database schema')
  console.log('❌ CANNOT DO: Admin-level operations')
  console.log('')
  console.log('🔧 SOLUTION: You run COMPLETE-SETUP.sql once,')
  console.log('   then I can handle everything else autonomously!')
}

testAutonomousCapabilities()