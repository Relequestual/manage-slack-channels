const { Octokit } = require('octokit');
const { rest } = require('msw');

const { server } = require('../test/msw/server');
const { fetchTopicsData } = require('./fetchTopicsData');

test('gets and decodes topic data from GitHub', async () => {
  const owner = 'owner_asdfghjkl';
  const repo = 'repo_asdfghjkl';
  const path = 'file_asdfghjkl.text';
  const auth = 'github_asdfghjkl';
  const octokit = new Octokit({ auth });
  const data = { channel_asdfghjkl: { topic: 'topic_qwertyuiop' } };

  server.use(
    rest.get('https://api.github.com/repos/:owner/:repo/contents/:filename', (_req, res, ctx) => {
      return res(ctx.text(JSON.stringify(data)));
    })
  );

  await expect(fetchTopicsData({ owner, repo, path, octokit })).resolves.toEqual(data);
});
