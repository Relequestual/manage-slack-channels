const { replaceAsync } = require('./replaceAsync');
const { decodeSlackUserMention } = require('./decodeSlackUserMention');

module.exports.decodeSlackLinks = async function decodeSlackLinks(message) {
  // Regular expression pattern to match encoded links
  const linkRegex = /<([^>|]+)(?:\|([^>]+))?>/g;

  // Replace encoded links with their decoded form
  const decodedMessage = await replaceAsync(message, linkRegex, async (match, url, label) => {
    if (url.startsWith('#C')) {
      // Channel link: <#C12345678|channel-name>
      const channelName = label || url.substring(url.indexOf('|') + 1, url.length - 1);
      return `#${channelName}`;
    } else if (url.startsWith('@U')) {
      // User mention link, <@U12134123123> - Does not include the username
      const decidedUsername = await decodeSlackUserMention(url);
      return `@${decidedUsername}`;
    } else {
      // Regular link: <https://example.com|label>
      return label || url;
    }
  });

  return decodedMessage;
};
