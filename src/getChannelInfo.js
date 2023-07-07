// const { decodeSlackLinks } = require('./decodeSlackLinks');

module.exports.getChannelInfo = async function getChannelInfo({ slackAPI }) {
  return slackAPI.paginate(
    'conversations.list',
    { types: 'public_channel', limit: 100 },
    // End iteration when there are no more cursors
    ({ response_metadata: { next_cursor } }) => next_cursor === '',
    async (acc = {}, { channels }) => ({
      ...acc,
      ...channels.reduce(
        (acc, { id, name, topic, is_member }) => ({
          ...acc,
          [name]: { id, topic: topic.value, is_member },
        }),
        {}
      ),
    })
  );
};
