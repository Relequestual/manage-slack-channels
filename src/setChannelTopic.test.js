const { WebClient } = require('@slack/web-api');
const { rest } = require('msw');

const { server } = require('../test/msw/server');
const { setChannelTopic } = require('./setChannelTopic');

beforeEach(() => {
  server.use(
    rest.post('https://slack.com/api/conversations.setTopic', (_req, res, ctx) => {
      return res(ctx.json({ ok: true }));
    })
  );
});

test('sets the Slack channel topic', async () => {
  const slackAPI = new WebClient('asdfghjkl');
  const channel = 'id_ASDFGHJKL';
  const topic = 'this is a topic';

  await expect(setChannelTopic({ slackAPI, channel, topic })).resolves.toBe(true);
});
