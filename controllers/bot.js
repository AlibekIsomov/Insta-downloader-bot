const TelegramBot = require('node-telegram-bot-api');
const instaScrapper = require('./insta')
require('dotenv').config()

// replace the value below with the Telegram token you receive from @BotFather
const token = '6868850706:AAH1HHn94duOexsrw0RDDzYu7rd6UP7rIVE'

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const password = "admin123";
const awaitingPassword = new Map(); // This will store whether a user is currently expected to enter a password

// Listen for the /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    awaitingPassword.set(chatId, true); // Set this user as awaiting a password
    bot.sendMessage(chatId, "Please enter the password:");  
});

// Listen for messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Check if this user has just been asked for a password
    if (awaitingPassword.get(chatId)) {
        // Check if the received message is the password
        if (text === password) {
            awaitingPassword.set(chatId, false); // Reset the password awaiting state
            bot.sendMessage(chatId, "Password accepted. Send me any Instagram link (except for stories) below and I'll send it back to you as a media file.");
        } else {
            bot.sendMessage(chatId, "Incorrect password. Please try again.");
        }
    }
    return;
});

const channelUsername = '@sxf_qarshimall'; // Replace with your channel username

const caption = `Siz SXF QARSHI MALL savdo markazidan o’zingiz istagan narsani topishingiz mumkin! 

🛒 Qashqadaryodagi eng yirik savdo majmualaridan biri
🛍️ 100 dan ortiq ko'p brendli do'konlar 
🎳 Farzandlaringiz uchun o'yin-kulgi
🍔 Oziq-ovqat 

📌 Ish vaqti har kuni 9:00 dan 23:00 gacha 

📲+ 998 (88) 674 11 11

Manzil: Qarshi shahri, A. Navoiy ko’chasi, 27`;

bot.on('message', async (msg) => {
  if (msg.text !== '/start' && msg.text.includes('https://www.instagram.com/')) {
    try {
      bot.sendMessage(msg.chat.id, 'Processing your link, please wait...')
      const post = await instaScrapper(msg.text)
      console.log(post);
      const chatId = msg.chat.id;
      const channelId = await bot.getChat(channelUsername).then(chat => chat.id);
      if (post.length > 0) {
        // Iterate through each media in the post
        post.forEach(async media => {
          // Send media to the user
          if (media.type === 'image') {
            bot.sendPhoto(msg.chat.id, media.link);
            // Send media to the channel
            bot.sendPhoto(channelId, media.link , { caption: caption });
          } else if (media.type === 'video') {
            bot.sendVideo(msg.chat.id, media.link);
            // Send media to the channel
            bot.sendVideo(channelId, media.link , { caption: caption });
          } else {
            bot.sendMessage(msg.chat.id, 'There was an error sending your link, please try again later');
          }
        })
      } else {
        bot.sendMessage(chatId, 'Could not find the media for that link.')
      }
    } catch (err) {
      console.log(err);
      bot.sendMessage(msg.chat.id,'An error occurred while processing the link. Try again!');
    }
  }
})