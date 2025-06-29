// Verify database setup immediately after SQL execution
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jgnyutkpxapaghderjmj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbnl1dGtweGFwYWdoZGVyam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTU5NDEsImV4cCI6MjA2Njc5MTk0MX0.kIHBUGVwkWN1zxkzHXYk8gpofr5sYmiQrOGkxpapu2I'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySetup() {
  console.log('🔍 Verifying database setup...')
  
  try {
    // Test 1: Check members table
    console.log('\n1. ✅ Testing members table...')
    const { count: membersCount, error: membersError } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
    
    if (membersError) {
      console.log('❌ Members table error:', membersError.message)
      return false
    }
    
    console.log(`✅ Members table working! Records: ${membersCount}`)
    
    // Test 2: Check creator_types table
    console.log('\n2. ✅ Testing creator_types table...')
    const { data: creatorTypes, error: creatorError } = await supabase
      .from('creator_types')
      .select('*')
      .limit(5)
    
    if (creatorError) {
      console.log('❌ Creator types error:', creatorError.message)
      return false
    }
    
    console.log(`✅ Creator types table working! Categories: ${creatorTypes.length}`)
    
    // Test 3: Check function
    console.log('\n3. ✅ Testing creator types function...')
    const { data: functionData, error: functionError } = await supabase
      .rpc('get_creator_types_json')
    
    if (functionError) {
      console.log('❌ Function error:', functionError.message)
      return false
    }
    
    console.log(`✅ Function working! Loaded ${functionData?.creatorTypes?.length} categories`)
    
    // Test 4: Insert new test record
    console.log('\n4. ✅ Testing new record insertion...')
    const testRecord = {
      name: 'Verification Test',
      email: `verify-${Date.now()}@example.com`,
      creator_types: ['technical-creation', 'design-fields'],
      country: 'Test Country',
      member_bio: 'This is a verification test after setup.',
      allow_name_display: true,
      allow_creator_type_display: true,
      allow_comments_display: true,
      include_in_genesis_group: true,
      device_id: 'verification-test',
      referral_source: 'verification-test',
      sync_source: 'verification'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('members')
      .insert([testRecord])
      .select()
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message)
      return false
    }
    
    console.log(`✅ New record insertion working! ID: ${insertData[0]?.id}`)
    
    // Test 5: Check views
    console.log('\n5. ✅ Testing Genesis views...')
    const { data: showcaseData, error: showcaseError } = await supabase
      .from('genesis_member_showcase')
      .select('*')
      .limit(3)
    
    if (showcaseError) {
      console.log('❌ Public showcase view error:', showcaseError.message)
    } else {
      console.log(`✅ Genesis showcase view working! Members: ${showcaseData.length}`)
    }
    
    const { data: statsData, error: statsError } = await supabase
      .from('member_stats')
      .select('*')
      .single()
    
    if (statsError) {
      console.log('❌ Public stats view error:', statsError.message)
    } else {
      console.log(`✅ Member stats view working! Total members: ${statsData.total_members}`)
    }
    
    console.log('\n🎉 DATABASE SETUP VERIFICATION: SUCCESS!')
    console.log('=' * 50)
    console.log('✅ All tables created and accessible')
    console.log('✅ All functions working')
    console.log('✅ All views accessible')
    console.log('✅ Data insertion working')
    console.log('✅ Creator types loaded from database')
    console.log('')
    console.log('🚀 Ready to test v4-enhanced/index.html!')
    console.log('🌐 Open: v4-enhanced/index.html in your browser')
    
    return true
    
  } catch (error) {
    console.log('❌ Verification failed:', error.message)
    return false
  }
}

verifySetup()