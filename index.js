const { WebClient } = require('@slack/web-api');
const github = require('@actions/github');
const core = require('@actions/core');

const slackAPIToken = core.getInput('SLACK_API_TOKEN', { required: true });
core.setSecret(slackAPIToken);
const slackAPI = new WebClient(slackAPIToken);

const githubAPIToken = core.getInput('GITHUB_TOKEN', { required: true });

console.log({githubAPIToken});

const octokit = github.getOctokit(githubAPIToken);

async function fetchTopicsData(owner, repo, filePath) {
  try {
    const response = await octokit.request(`GET /repos/${owner}/${repo}/contents/${filePath}`);
    console.log('Making request', `GET /repos/${owner}/${repo}/contents/${filePath}`);

    if (response.status === 200) {
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return JSON.parse(content);
    } else {
      console.error('Failed to retrieve topics data:', response);
      return null;
    }
  } catch (error) {
    console.error('Error fetching topics data:', error);
    return null;
  }
}

async function getChannelInfo() {
  try {
    const channels = [];
    for await (const page of slackAPI.paginate('conversations.list', {
      types: 'public_channel',
      limit: 100, // Set the desired page size here
    })) {
      channels.push(...page.channels);
    }

    const channelPromises = channels.map(async (channel) => {
      return {
        [channel.name]: {
          id: channel.id,
          topic: await decodeSlackLinks(channel.topic.value),
          is_member: channel.is_member,
        }
      };
    });

    const channelObjects = await Promise.all(channelPromises);

    const result = channelObjects.reduce((map, channelObject) => {
      return { ...map, ...channelObject };
    }, {});

    return result;

  } catch (error) {
    console.error('Error fetching channel info:', error);
    return null;
  }
}

async function fixChannelTopic(channelId, desiredTopic) {
  try {
    const response = await slackAPI.conversations.setTopic({
      channel: channelId,
      topic: desiredTopic,
    });

    if (response.ok) {
      return true;
    } else {
      console.error('Failed to fix channel topic:', response.error);
      return false;
    }
  } catch (error) {
    console.error('Error fixing channel topic:', error);
    return false;
  }
}

async function sendNotification(channelId) {
  const githubRepo = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`;
  const message = `The channel topic has been updated by a bot. Channel topics are managed in the following GitHub repository: ${githubRepo}`;

  try {
    const response = await slackAPI.chat.postMessage({
      channel: channelId,
      text: message,
    });

    if (response.ok) {
      console.log(`Notification sent to channel ${channelId}`);
    } else {
      console.error('Failed to send notification:', response.error);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

async function joinChannel(channelID) {
  try {
    return slackAPI.conversations.join({ channel: channelID });
  } catch (error){
    console.error('Cannot join channel', error);
  }
}

async function decodeSlackLinks(message) {
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
}

async function decodeSlackUserMention(userMention) {
  // Get the user ID from the mention
  const userId = userMention.replace(/^@(.+)$/, '$1');
  // Replace user mention with their decoded form
    try {
      // Call Slack API to get user information
      const userInfo = await slackAPI.users.info({
        user: userId
      });

      // Extract the username from the user information
      const username = userInfo.user.profile.display_name || userInfo.user.name;

      return `${username}`;
    } catch (error) {
      console.error(`Error retrieving user information for user ID: ${userId}`, error);
      return false;
    }

}

// Helper function to support asynchronous replace operations
async function replaceAsync(string, regex, asyncCallback) {
  const matches = Array.from(string.matchAll(regex));
  const replacements = await Promise.all(matches.map(([match, ...args]) => asyncCallback(match, ...args)));
  // Remember, replace function can be called multiple times
  let currentIndex = 0;
  return string.replace(regex, () => replacements[currentIndex++]);
}




async function run() {

  // const {owner, repo, filePath} = process.env;
  const owner    = core.getInput('owner',    {required: true});
  const repo     = core.getInput('repo',     {required: true});
  const filePath = core.getInput('filePath', {required: true});
  const isDryRun = core.getBooleanInput('dryRun');

  const channelInfo = await getChannelInfo();
  if (!channelInfo) {
    console.log('Channel info not available. Exiting...');
    return;
  } else {
    console.log({channelInfo});
  }

  const topicsData = await fetchTopicsData(owner, repo, filePath);

  if (!topicsData) {
    console.log('Topics data not available. Exiting...');
    return;
  } else {
    console.log({topicsData});
  }

  console.log('Starting channel topic updates...');

  const channels = Object.keys(topicsData.channels);
  console.log({channels});
  for (const channel of channels) {
    const channelData = channelInfo[channel];
    if (channelData) {
      const { id, is_member, topic: currentTopic } = channelData;
      const desiredTopic = topicsData.channels[channel];
      if (currentTopic !== desiredTopic) {
        console.log('channel topic will be fixed', {channel});
        console.log({currentTopic ,desiredTopic});
        if (!isDryRun) {
          if (!is_member) {
            await joinChannel(id);
          } else {
            console.log(`Already joined channel "${channel}"`);
          }
          if (await fixChannelTopic(id, desiredTopic)) {
            await sendNotification(id);
          }
        } else {
          console.log(`Not updating ${channel} topic as running in dryRun mode`)
        }
      } else {
        console.log('channel topic do NOT need fixing', {channel});
      }
    } else {
      console.error(`Unable to find ${channel} on slack server`);
    }
  }

  console.log('Channel topic updates completed.');
}

run();