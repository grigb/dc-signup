// Apply database schemas automatically
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// SECURITY WARNING: Previous JWT exposed in repository 
const supabaseUrl = process.env.SUPABASE_URL || 'https://jgnyutkpxapaghderjmj.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'REPLACE_WITH_NEW_SECURE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function applySchemas() {
  console.log('🔧 Applying database schemas...')
  
  try {
    // First, let's try some basic schema additions that we can do with the anon key
    console.log('1. Testing current schema access...')
    
    // Check if we can add columns (this might not work with anon key)
    const alterCommands = [
      // Add privacy columns if they don't exist
      "ALTER TABLE signups ADD COLUMN IF NOT EXISTS allow_name_display BOOLEAN DEFAULT false",
      "ALTER TABLE signups ADD COLUMN IF NOT EXISTS allow_creator_type_display BOOLEAN DEFAULT false", 
      "ALTER TABLE signups ADD COLUMN IF NOT EXISTS allow_comments_display BOOLEAN DEFAULT false",
      "ALTER TABLE signups ADD COLUMN IF NOT EXISTS include_in_first_hundred BOOLEAN DEFAULT false",
      "ALTER TABLE signups ADD COLUMN IF NOT EXISTS member_bio TEXT"
    ]
    
    console.log('⚠️  Note: Schema changes require elevated permissions')
    console.log('   The anon key cannot modify table structure')
    console.log('   You need to run the SQL scripts manually in Supabase dashboard')
    console.log('')
    console.log('🌐 Go to: https://supabase.com/dashboard/project/jgnyutkpxapaghderjmj/sql')
    console.log('')
    console.log('📋 Scripts to run:')
    console.log('1. Copy and paste ENHANCED-SCHEMA.sql')
    console.log('2. Copy and paste CREATOR-TYPES-SCHEMA.sql')
    console.log('')
    
    // Test what we can do with current permissions
    console.log('2. Testing current table access...')
    
    const { data: signupsTest, error: signupsError } = await supabase
      .from('signups')
      .select('*')
      .limit(1)
    
    if (signupsError) {
      console.error('❌ Cannot access signups table:', signupsError.message)
      return
    }
    
    console.log('✅ Signups table accessible')
    
    // Check if creator_types table exists
    const { data: creatorTest, error: creatorError } = await supabase
      .from('creator_types')
      .select('*')
      .limit(1)
    
    if (creatorError) {
      console.log('❌ Creator types table not found:', creatorError.message)
      console.log('   Need to run CREATOR-TYPES-SCHEMA.sql')
    } else {
      console.log('✅ Creator types table exists')
    }
    
    // Test insert to see what fields are available
    console.log('3. Testing available fields...')
    
    const testData = {
      name: 'Schema Test',
      email: `schema-test-${Date.now()}@example.com`,
      creator_types: ['technical-creation'],
      country: 'Test Country',
      device_id: 'schema-test',
      referral_source: 'schema-test'
    }
    
    const { data: insertResult, error: insertError } = await supabase
      .from('signups')
      .insert([testData])
      .select()
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message)
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        console.log('   Missing columns detected - need to run ENHANCED-SCHEMA.sql')
      }
    } else {
      console.log('✅ Basic insert successful')
      console.log('📝 Available fields working:', Object.keys(insertResult[0]))
    }
    
  } catch (error) {
    console.error('❌ Schema application failed:', error.message)
  }
}

// Function to display SQL content for manual execution
function showSQLScripts() {
  console.log('\n📋 SQL SCRIPTS TO RUN MANUALLY:')
  console.log('=' * 50)
  
  try {
    console.log('\n🔧 ENHANCED-SCHEMA.sql:')
    console.log('-' * 30)
    const enhancedSchema = fs.readFileSync('./ENHANCED-SCHEMA.sql', 'utf8')
    console.log(enhancedSchema)
    
    console.log('\n🔧 CREATOR-TYPES-SCHEMA.sql:')
    console.log('-' * 30)
    const creatorSchema = fs.readFileSync('./CREATOR-TYPES-SCHEMA.sql', 'utf8')
    console.log(creatorSchema)
    
  } catch (error) {
    console.log('❌ Could not read SQL files:', error.message)
  }
}

// Run the schema application
applySchemas().then(() => {
  console.log('\n🎯 Next steps:')
  console.log('1. Go to Supabase SQL Editor')
  console.log('2. Run ENHANCED-SCHEMA.sql')
  console.log('3. Run CREATOR-TYPES-SCHEMA.sql') 
  console.log('4. Test v4-enhanced/index.html')
  console.log('\n🌐 Supabase SQL Editor: https://supabase.com/dashboard/project/jgnyutkpxapaghderjmj/sql')
})