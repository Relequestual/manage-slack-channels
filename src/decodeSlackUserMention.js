const core = require('@actions/core');

module.exports.decodeSlackUserMention = async function decodeSlackUserMention({
  slackAPI,
  userMention,
}) {
  // Get the user ID from the mention
  const userId = userMention.replace(/^@(.+)$/, '$1');
  // Replace user mention with their decoded form
  try {
    // Call Slack API to get user information
    const userInfo = await slackAPI.users.info({
      user: userId,
    });

    // Extract the username from the user information
    const username = userInfo.user.profile.display_name || userInfo.user.name;

    return `${username}`;
  } catch (error) {
    core.error(`Error retrieving user information for user ID: ${userId}`, error);
    return;
  }
};
