module.exports.joinChannel = async function joinChannel({ slackAPI, channel }) {
  const {
    channel: { id },
  } = await slackAPI.conversations.join({ channel });

  return id;
};
