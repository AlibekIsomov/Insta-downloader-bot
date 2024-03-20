const TelegramBot = require('node-telegram-bot-api');
const instaScrapper = require('./insta')
require('dotenv').config()

// replace the value below with the Telegram token you receive from @BotFather
const token = '6868850706:AAH1HHn94duOexsrw0RDDzYu7rd6UP7rIVE'

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Send me any Instagram link(except for stories) below and I'll send it back to you as a media file");
});

const channelUsername = '@xasdxasdasd'; // Replace with your channel username

const caption = 'This is a photo of a beautiful sunset.';
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