// Test and setup Supabase database
const { createClient } = require('@supabase/supabase-js')

// SECURITY WARNING: Previous key was exposed in Git history
// Use environment variables or update with new secure key
const supabaseUrl = process.env.SUPABASE_URL || 'https://jgnyutkpxapaghderjmj.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'REPLACE_WITH_NEW_SECURE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...')
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...')
    const { data: testData, error: testError } = await supabase
      .from('signups')
      .select('count(*)', { count: 'exact', head: true })
    
    if (testError) {
      console.error('❌ Connection failed:', testError.message)
      return
    }
    
    console.log('✅ Basic connection working')
    
    // Check if enhanced schema columns exist
    console.log('2. Checking existing schema...')
    const { data: columns, error: schemaError } = await supabase
      .from('signups')
      .select('*')
      .limit(1)
    
    if (schemaError) {
      console.error('❌ Schema check failed:', schemaError.message)
      return
    }
    
    console.log('✅ Signups table exists')
    
    // Check if creator_types table exists
    console.log('3. Checking creator_types table...')
    const { data: creatorTypes, error: creatorError } = await supabase
      .from('creator_types')
      .select('count(*)', { count: 'exact', head: true })
    
    if (creatorError) {
      console.log('⚠️  Creator types table does not exist yet')
      console.log('   Need to run CREATOR-TYPES-SCHEMA.sql')
    } else {
      console.log('✅ Creator types table exists')
    }
    
    // Test the creator types function if table exists
    if (!creatorError) {
      console.log('4. Testing creator types function...')
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_creator_types_json')
      
      if (functionError) {
        console.error('❌ Creator types function failed:', functionError.message)
      } else {
        console.log('✅ Creator types function working')
        console.log('📊 Creator types loaded:', functionData?.creatorTypes?.length || 0, 'categories')
      }
    }
    
    // Test a sample insert
    console.log('5. Testing sample signup insert...')
    const testSubmission = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      creator_types: ['technical-creation'],
      country: 'United States',
      member_bio: 'This is a test submission',
      allow_name_display: true,
      allow_creator_type_display: true,
      allow_comments_display: false,
      include_in_first_hundred: true,
      device_id: 'test-device',
      referral_source: 'automated-test',
      sync_source: 'test'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('signups')
      .insert([testSubmission])
      .select()
    
    if (insertError) {
      console.error('❌ Test insert failed:', insertError.message)
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        console.log('   Need to run ENHANCED-SCHEMA.sql to add privacy columns')
      }
    } else {
      console.log('✅ Test signup insert successful')
      console.log('📝 Inserted record ID:', insertData[0]?.id)
    }
    
    console.log('\n🎉 Database setup check complete!')
    console.log('\nNext steps:')
    console.log('1. If creator_types table missing: Run CREATOR-TYPES-SCHEMA.sql')
    console.log('2. If privacy columns missing: Run ENHANCED-SCHEMA.sql') 
    console.log('3. Test the v4-enhanced form at v4-enhanced/index.html')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

setupDatabase()