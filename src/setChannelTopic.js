module.exports.setChannelTopic = async function setChannelTopic({ slackAPI, channel, topic }) {
  const { ok } = await slackAPI.conversations.setTopic({
    channel,
    topic,
  });

  return ok;
};
