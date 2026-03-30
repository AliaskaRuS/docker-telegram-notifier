// src/telegram.js
const { Telegram } = require('telegraf');

let HttpsProxyAgent;
const tryLoadProxyAgent = () => {
  if (!HttpsProxyAgent) {
    try {
      const mod = require('https-proxy-agent');
      HttpsProxyAgent = mod.HttpsProxyAgent || mod;
    } catch (e) {
    }
  }
  return HttpsProxyAgent;
};

class TelegramClient {
  constructor() {
    const token = process.env.TELEGRAM_NOTIFIER_BOT_TOKEN;
    const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
    
    let agent = undefined;
    if (proxyUrl && tryLoadProxyAgent()) {
      try {
        agent = new HttpsProxyAgent(proxyUrl);
        console.log(`🔗 Telegram proxy: ${proxyUrl}`);
      } catch (e) {
        console.warn(`⚠️ Proxy agent error: ${e.message}`);
      }
    }
    
    const telegramOptions = agent ? { telegram: { agent } } : {};
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
