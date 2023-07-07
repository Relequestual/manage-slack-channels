const { WebClient } = require('@slack/web-api');
const { rest } = require('msw');

const { server } = require('../test/msw/server');
const { joinChannel } = require('./joinChannel');

beforeEach(() => {
  server.use(
    rest.post('https://slack.com/api/conversations.join', async (req, res, ctx) => {
      const channel = new URLSearchParams(await req.text()).get('channel');

      return res(ctx.json({ ok: true, channel: { id: channel } }));
    })
  );
});

test('joins the specified Slack channel', async () => {
  const channel = 'id_ASDFGHJKL';
  const slackAPI = new WebClient('asdfghjkl');

  await expect(joinChannel({ slackAPI, channel })).resolves.toBe(channel);
});
