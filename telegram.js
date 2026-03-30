// src/telegram.js
const { Telegraf } = require('telegraf');

class TelegramClient {
  constructor() {
    const token = process.env.TELEGRAM_NOTIFIER_BOT_TOKEN;
    
    let telegrafOptions = {};
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    
    if (proxyUrl && !proxyUrl.includes('localhost') && !proxyUrl.includes('127.0.0.1')) {
      try {
        const { HttpsProxyAgent } = require('https-proxy-agent');
        
        const agent = new HttpsProxyAgent(proxyUrl);
        
        telegrafOptions = {
          telegram: {
            agent: agent,
            attachmentAgent: agent
          }
        };
        
        console.log(`✅ Proxy configured: ${proxyUrl}`);
      } catch (e) {
        console.warn(`⚠️ Proxy setup failed: ${e.message}`);
      }
    }
    
    const bot = new Telegraf(token, telegrafOptions);
    this.telegram = bot.telegram;
    
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
      options.message_thread_id = parseInt(threadId, 10);
    }

    const chatId = overrides.chatId || process.env.TELEGRAM_NOTIFIER_CHAT_ID;

    return this.telegram.sendMessage(chatId, message, options);
  }

  async sendError(e, overrides = {}) {
    const options = {};
    
    const threadId = overrides.threadId || this.threadId;
    if (threadId) {
      options.message_thread_id = parseInt(threadId, 10);
    }

    const chatId = overrides.chatId || process.env.TELEGRAM_NOTIFIER_CHAT_ID;

    return this.telegram.sendMessage(chatId, `Error: ${e}`, options);
  }

  check() {
    return this.telegram.getMe();
  }
}

module.exports = TelegramClient;
