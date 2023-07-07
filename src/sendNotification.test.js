const { WebClient } = require('@slack/web-api');
const { rest } = require('msw');

const { server } = require('../test/msw/server');
const { sendNotification } = require('./sendNotification');

beforeEach(() => {
  server.use(
    rest.post('https://slack.com/api/chat.postMessage', (_req, res, ctx) => {
      return res(ctx.json({ ok: true }));
    })
  );
});

test('sets the Slack channel topic', async () => {
  const slackAPI = new WebClient('asdfghjkl');
  const channel = 'id_ASDFGHJKL';
  const owner = 'owner_asdfghjkl';
  const repo = 'repo_asdfghjkl';

  await expect(sendNotification({ slackAPI, channel, owner, repo })).resolves.toBe(true);
});
