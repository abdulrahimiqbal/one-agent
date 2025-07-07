const { OpenAI } = require('openai');
require('dotenv').config({ path: '.env.local' });

async function checkDeepSeekBalance() {
  console.log('💰 Checking DeepSeek account balance...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    return;
  }
  
  console.log('✅ API key found');
  console.log('🔑 Key starts with:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
  
  try {
    // Using fetch to check balance since OpenAI client doesn't have this endpoint
    const response = await fetch('https://api.deepseek.com/user/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Error checking balance:', response.status, response.statusText);
      return;
    }

    const balanceData = await response.json();
    
    console.log('💰 DeepSeek Balance Information:');
    console.log('📊 Account Available:', balanceData.is_available ? '✅ Yes' : '❌ No');
    
    if (balanceData.balance_infos && balanceData.balance_infos.length > 0) {
      balanceData.balance_infos.forEach((balance, index) => {
        console.log(`\n💳 Balance ${index + 1}:`);
        console.log(`   Currency: ${balance.currency}`);
        console.log(`   Total Balance: ${balance.total_balance}`);
        console.log(`   Granted Balance: ${balance.granted_balance}`);
        console.log(`   Topped-up Balance: ${balance.topped_up_balance}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking DeepSeek balance:', error.message);
  }
}

checkDeepSeekBalance(); 