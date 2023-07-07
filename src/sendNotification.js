module.exports.sendNotification = async function sendNotification({
  slackAPI,
  channel,
  owner,
  repo,
}) {
  const url = `https://github.com/${owner}/${repo}`;
  const text = `The channel topic has been updated by a bot. Channel topics are managed in a GitHub repository at ${url}`;

  const { ok } = await slackAPI.chat.postMessage({
    channel,
    text,
  });

  return ok;
};
