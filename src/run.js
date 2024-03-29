const core = require('@actions/core');
const { WebClient } = require('@slack/web-api');
const { Octokit } = require('octokit');

const { getChannelInfo } = require('./getChannelInfo');
const { fetchTopicsData } = require('./fetchTopicsData');
const { joinChannel } = require('./joinChannel');
const { setChannelTopic } = require('./setChannelTopic');
const { sendNotification } = require('./sendNotification');

module.exports.run = async function run({ owner, repo, path, dryRun, slackAPIToken, githubToken }) {
  core.debug('owner', owner);
  core.debug('repo', repo);
  core.debug('path', path);
  core.debug('dryRun', dryRun);

  const requiredArgs = { owner, repo, path, dryRun, slackAPIToken, githubToken };

  if (Object.values(requiredArgs).includes(undefined)) {
    const missingArgs = Object.keys(requiredArgs)
      .filter((arg) => requiredArgs[arg] === undefined)
      .join(',');
    core.setFailed(`Missing arguments to run function: ${missingArgs}`);
    return;
  }

  core.info('Starting channel topic updates.');

  const slackAPI = new WebClient(slackAPIToken);
  const octokit = new Octokit({ auth: githubToken });

  const channelInfo = await getChannelInfo({ slackAPI });

  if (!channelInfo) {
    core.setFailed('Channel info not available. Exiting.');
    return;
  }

  const channelNames = Object.values(channelInfo).map((c) => c.name);

  core.info('Found channel(s):', ...channelNames);

  const topicsData = await fetchTopicsData({ octokit, owner, repo, path });

  if (!topicsData) {
    core.setFailed('Topics data not available. Exiting.');
    return;
  }

  const desiredTopics = topicsData.channels;

  const topicChannels = Object.keys(desiredTopics);

  core.info(`Found topic data for channel(s):${topicChannels.join(',')}`);

  for (let [name, topic] of Object.entries(desiredTopics)) {
    let { [name]: channel } = channelInfo;

    if (!channel) {
      core.error(`Unknown channel ${channel}`);
      continue;
    }

    if (!channel.is_member) {
      core.info(`Joining channel ${name} (${channel.id})`);

      if (!dryRun) {
        await joinChannel({ slackAPI, channel: channel.id });
      }
    }
    core.info(`Comparing topics. GitHub: ${topic}. Slack: ${channel.topic}`);

    if (channel.topic !== topic) {
      core.info(`Changing topic for channel ${name} to ${topic}`);

      if (!dryRun) {
        await setChannelTopic({ slackAPI, channel: channel.id, topic });
        await sendNotification({ slackAPI, channel: channel.id, owner, repo });
      }

      core.info(`Changed topic and notified ${name}`);
    }
  }

  core.info('Channel topic updates completed.');
};
