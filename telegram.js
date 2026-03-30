// src/telegram.js
const { Telegram } = require('telegraf');

let HttpsProxyAgent;
const tryLoadProxyAgent = () => {
  if (!HttpsProxyAgent) {
    try {
      console.log('🔍 Loading https-proxy-agent...');
      const mod = require('https-proxy-agent');
      
      console.log('📦 Module loaded:', typeof mod);
      console.log('📦 Has HttpsProxyAgent:', 'HttpsProxyAgent' in mod);
      console.log('📦 Has default:', 'default' in mod);
      
      HttpsProxyAgent = 
        mod.HttpsProxyAgent ||      
        mod.default ||              
        mod;                        
      
      console.log('✅ Agent resolved:', typeof HttpsProxyAgent === 'function' ? 'function' : 'unknown');
      
    } catch (e) {
      console.error('❌ Failed to load https-proxy-agent:', e.message);
      console.error('❌ Error code:', e.code);
      console.error('❌ Stack:', e.stack);
    }
  }
  
  const result = !!HttpsProxyAgent;
  console.log('🔗 tryLoadProxyAgent() returns:', result);
  return HttpsProxyAgent;
};

class TelegramClient {
  constructor() {
    const token = process.env.TELEGRAM_NOTIFIER_BOT_TOKEN;
    const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
    
    if (proxyUrl) {
      try {
        console.log('🔍 Setting up global proxy agent...');
        const { HttpsProxyAgent } = require('https-proxy-agent');
        const agent = new HttpsProxyAgent(proxyUrl);
        
        const https = require('https');
        https.globalAgent = agent;
        
        const http = require('http');
        http.globalAgent = agent;
        
        console.log(`🔗 Global proxy agent set: ${proxyUrl}`);
      } catch (e) {
        console.warn(`⚠️ Failed to set global proxy: ${e.message}`);
      }
    }
    
    this.telegram = new Telegram(token);
    
    this.threadId = 
      process.env.TELEGRAM_NOTIFIER_TOPIC_ID || 
      process.env.TELEGRAM_NOTIFIER_THREAD_ID || 
      null;
  }
    
    this.threadId = 
      process.env.TELEGRAM_NOTIFIER_TOPIC_ID || 
      process.env.TELEGRAM_NOTIFIER_THREAD_ID || 
      null;
  }

  async send(message, overrides = {}) {
    const options = {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };

    const threadId = overrides.threadId || this.threadId;
    if (threadId) {
      options.message_thread_id = parseInt(threadId);
    }

    const chatId = overrides.chatId || process.env.TELEGRAM_NOTIFIER_CHAT_ID;

    return this.telegram.sendMessage(chatId, message, options);
  }

  async sendError(e, overrides = {}) {
    const options = {};
    
    const threadId = overrides.threadId || this.threadId;
    if (threadId) {
      options.message_thread_id = parseInt(threadId);
    }

    const chatId = overrides.chatId || process.env.TELEGRAM_NOTIFIER_CHAT_ID;

    return this.telegram.sendMessage(chatId, `Error: ${e}`, options);
  }

  check() {
    return this.telegram.getMe();
  }
}

module.exports = TelegramClient;
