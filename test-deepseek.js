const { OpenAI } = require('openai');
require('dotenv').config({ path: '.env.local' });

async function testDeepSeek() {
  console.log('🔍 Testing DeepSeek API...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    return;
  }
  
  console.log('✅ API key found');
  console.log('🔑 Key starts with:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.deepseek.com',
  });

  try {
    console.log('🔄 Making test API call to DeepSeek...');
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: 'What is Newton\'s second law of motion? Please explain briefly.'
        }
      ],
      max_tokens: 150,
      temperature: 0.1
    });

    console.log('✅ DeepSeek API Response:');
    console.log('📝 Content:', completion.choices[0].message.content);
    console.log('🔢 Tokens used:', completion.usage?.total_tokens || 'N/A');
    console.log('💰 Model:', completion.model);
    
  } catch (error) {
    console.error('❌ DeepSeek API Error:', error.message);
    if (error.response) {
      console.error('📄 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
    }
  }
}

testDeepSeek(); 