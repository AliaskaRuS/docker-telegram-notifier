// src/telegram.js
const { Telegram } = require('telegraf');

class TelegramClient {
  constructor() {
    const token = process.env.TELEGRAM_NOTIFIER_BOT_TOKEN;
    
    let telegramOptions = {};
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    
    if (proxyUrl && !proxyUrl.includes('localhost') && !proxyUrl.includes('127.0.0.1')) {
      try {
        const { HttpsProxyAgent } = require('https-proxy-agent');
        
        const agent = new HttpsProxyAgent(proxyUrl);
        
        telegramOptions = {
          telegram: {
            agent, attachmentAgent: agent
          }
        };
        
        console.log(`✅ Proxy configured: ${proxyUrl}`);
      } catch (e) {
        console.warn(`⚠️ Proxy setup failed: ${e.message}`);
      }
    }
    
    this.telegram = new Telegram(token, telegramOptions);
    
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
