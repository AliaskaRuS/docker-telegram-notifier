// src/telegram.js
const { Telegram } = require('telegraf');

class TelegramClient {
  constructor() {
    const token = process.env.TELEGRAM_NOTIFIER_BOT_TOKEN;
    const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
    
    if (proxyUrl) {
      try {
        const { HttpsProxyAgent } = require('https-proxy-agent');
        const agent = new HttpsProxyAgent(proxyUrl);
        
        require('https').globalAgent = agent;
        require('http').globalAgent = agent;
        
        console.log(`🔗 Proxy enabled: ${proxyUrl}`);
      } catch (e) {
        if (e.code === 'ERR_REQUIRE_ESM' || e.message.includes('exports')) {
          try {
            (async () => {
              const { HttpsProxyAgent } = await import('https-proxy-agent');
              const agent = new HttpsProxyAgent(proxyUrl);
              require('https').globalAgent = agent;
              require('http').globalAgent = agent;
              console.log(`🔗 Proxy enabled (ESM): ${proxyUrl}`);
            })();
          } catch (e2) {
            console.warn(`⚠️ Proxy setup failed: ${e2.message}`);
          }
        } else {
          console.warn(`⚠️ Proxy setup failed: ${e.message}`);
        }
      }
    }
    
    this.telegram = new Telegram(token);
    
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
