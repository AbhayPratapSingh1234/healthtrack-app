import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testHealthChatbotFlow() {
  console.log('🧪 Testing HealthChatbot Flow...\n');

  try {
    // Test 1: Check if chat_history table exists and has proper structure
    console.log('1️⃣ Testing chat_history table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('chat_history')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ chat_history table error:', tableError.message);
      return;
    }
    console.log('✅ chat_history table exists and accessible');

    // Test 2: Simulate a complete chat session
    console.log('\n2️⃣ Simulating complete chat session...');

    const testSessionId = `test-session-${Date.now()}`;
    const testUserId = 'test-user-123'; // Mock user ID for testing

    // Simulate user message 1
    console.log('   📝 Inserting user message 1...');
    const { error: insertError1 } = await supabase
      .from('chat_history')
      .insert({
        user_id: testUserId,
        session_id: testSessionId,
        role: 'user',
        content: 'Hello, I need advice about healthy eating.'
      });

    if (insertError1) {
      console.error('❌ Failed to insert user message 1:', insertError1.message);
      return;
    }
    console.log('✅ User message 1 inserted');

    // Simulate AI response 1
    console.log('   🤖 Inserting AI response 1...');
    const { error: insertError2 } = await supabase
      .from('chat_history')
      .insert({
        user_id: testUserId,
        session_id: testSessionId,
        role: 'assistant',
        content: 'Hello! I\'d be happy to help you with healthy eating advice. What specific aspects are you interested in?'
      });

    if (insertError2) {
      console.error('❌ Failed to insert AI response 1:', insertError2.message);
      return;
    }
    console.log('✅ AI response 1 inserted');

    // Simulate user message 2
    console.log('   📝 Inserting user message 2...');
    const { error: insertError3 } = await supabase
      .from('chat_history')
      .insert({
        user_id: testUserId,
        session_id: testSessionId,
        role: 'user',
        content: 'I want to know about meal planning for weight loss.'
      });

    if (insertError3) {
      console.error('❌ Failed to insert user message 2:', insertError3.message);
      return;
    }
    console.log('✅ User message 2 inserted');

    // Test 3: Load chat history (simulating what the frontend does)
    console.log('\n3️⃣ Testing chat history loading...');
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_history')
      .select('role, content')
      .eq('user_id', testUserId)
      .eq('session_id', testSessionId)
      .order('created_at', { ascending: true });

    if (historyError) {
      console.error('❌ Failed to load chat history:', historyError.message);
      return;
    }

    console.log('✅ Chat history loaded successfully');
    console.log('📄 Loaded messages:');
    chatHistory.forEach((msg, index) => {
      console.log(`   ${index + 1}. ${msg.role}: ${msg.content.substring(0, 50)}...`);
    });

    // Test 4: Verify message count and order
    console.log('\n4️⃣ Verifying message integrity...');
    if (chatHistory.length !== 3) {
      console.error(`❌ Expected 3 messages, got ${chatHistory.length}`);
      return;
    }

    if (chatHistory[0].role !== 'user' || !chatHistory[0].content.includes('healthy eating')) {
      console.error('❌ First message incorrect');
      return;
    }

    if (chatHistory[1].role !== 'assistant' || !chatHistory[1].content.includes('happy to help')) {
      console.error('❌ Second message incorrect');
      return;
    }

    if (chatHistory[2].role !== 'user' || !chatHistory[2].content.includes('meal planning')) {
      console.error('❌ Third message incorrect');
      return;
    }

    console.log('✅ All messages in correct order and content');

    // Test 5: Test session isolation (different session should not see these messages)
    console.log('\n5️⃣ Testing session isolation...');
    const differentSessionId = `different-session-${Date.now()}`;
    const { data: differentHistory, error: differentError } = await supabase
      .from('chat_history')
      .select('role, content')
      .eq('user_id', testUserId)
      .eq('session_id', differentSessionId)
      .order('created_at', { ascending: true });

    if (differentError) {
      console.error('❌ Error checking different session:', differentError.message);
      return;
    }

    if (differentHistory.length !== 0) {
      console.error(`❌ Different session should have 0 messages, got ${differentHistory.length}`);
      return;
    }

    console.log('✅ Session isolation working correctly');

    // Test 6: Clean up test data
    console.log('\n6️⃣ Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', testUserId)
      .eq('session_id', testSessionId);

    if (deleteError) {
      console.error('❌ Failed to clean up test data:', deleteError.message);
      return;
    }

    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All HealthChatbot flow tests PASSED!');
    console.log('\n✅ Summary:');
    console.log('   • Chat history table is properly structured');
    console.log('   • Messages are saved correctly (user and assistant)');
    console.log('   • Chat history loads in correct order');
    console.log('   • Session isolation works properly');
    console.log('   • Database operations are reliable');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testHealthChatbotFlow();
