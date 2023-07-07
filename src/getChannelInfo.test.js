const { WebClient } = require('@slack/web-api');
const { rest } = require('msw');

const { getChannelInfo } = require('./getChannelInfo');
const { server } = require('../test/msw/server');

beforeEach(() => {
  server.use(
    rest.post('https://slack.com/api/conversations.list', (_req, res, ctx) => {
      return res(
        ctx.json({
          ok: true,
          channels: [
            {
              id: 'QWERTYUIOP',
              name: 'general',
              is_channel: true,
              is_group: false,
              is_im: false,
              is_mpim: false,
              is_private: false,
              created: 1616146982,
              is_archived: false,
              is_general: true,
              unlinked: 0,
              name_normalized: 'general',
              is_shared: false,
              is_org_shared: false,
              is_pending_ext_shared: false,
              pending_shared: [],
              context_team_id: 'LKJHGFDSA',
              updated: 1681212314271,
              parent_conversation: null,
              creator: 'ASDFGHJKL123456789',
              is_ext_shared: false,
              shared_team_ids: ['LKJHGFDSA'],
              pending_connected_team_ids: [],
              is_member: false,
              topic: { value: '', creator: '', last_set: 0 },
              purpose: {
                value: 'This is the one channel that will always include everyone.',
                creator: 'ASDFGHJKL123456789',
                last_set: 1616146982,
              },
              previous_names: [],
              num_members: 1,
            },
          ],
          response_metadata: { next_cursor: '' },
        })
      );
    })
  );
});

test('gets a list of channels from Slack', async () => {
  const slackAPI = new WebClient('asdfghjkl');

  await expect(getChannelInfo({ slackAPI })).resolves.toEqual({
    general: {
      id: 'QWERTYUIOP',
      topic: '',
      is_member: false,
    },
  });
});
