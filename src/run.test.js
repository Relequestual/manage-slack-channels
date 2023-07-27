const core = require('@actions/core');
const { WebClient } = require('@slack/web-api');
const { Octokit } = require('octokit');

const { run } = require('./run');
const { getChannelInfo } = require('./getChannelInfo');
const { fetchTopicsData } = require('./fetchTopicsData');
const { joinChannel } = require('./joinChannel');
const { setChannelTopic } = require('./setChannelTopic');
const { sendNotification } = require('./sendNotification');

jest.mock('./getChannelInfo', () => ({
  getChannelInfo: jest.fn(),
}));

jest.mock('./fetchTopicsData', () => ({
  fetchTopicsData: jest.fn(),
}));

jest.mock('./joinChannel', () => ({
  joinChannel: jest.fn(),
}));

jest.mock('./setChannelTopic', () => ({
  setChannelTopic: jest.fn(),
}));

jest.mock('./sendNotification', () => ({
  sendNotification: jest.fn(),
}));

beforeEach(() => {
  jest.spyOn(core, 'debug').mockImplementation(() => true);
  jest.spyOn(core, 'info').mockImplementation(() => true);
});

test('example invocation, not comprehensive', async () => {
  const owner = 'owner_asdfghjkl';
  const repo = 'repo_asdfghjkl';
  const path = 'file_asdfghjkl.text';
  const dryRun = false;
  const githubToken = 'github_asdfghjkl';
  const slackAPIToken = 'slack_asdfghjkl';
  const mockChannelInfo = {
    qwertyuiop: { id: 'qwertyuiop', is_member: true, topic: 'qwertyuiop' },
    asdfghjkl: { id: 'asdfghjkl', is_member: false, topic: 'asdfghjkl' },
  };
  const mockTopicData = {
    qwertyuiop: { topic: 'qwertyuiop' },
    asdfghjkl: { topic: 'asdfghjklasdfghjkl' },
  };

  getChannelInfo.mockResolvedValueOnce(mockChannelInfo);
  fetchTopicsData.mockResolvedValueOnce(mockTopicData);
  fetchTopicsData.mockResolvedValueOnce(true);
  sendNotification.mockResolvedValueOnce(true);

  await run({ owner, repo, path, dryRun, githubToken, slackAPIToken });

  expect(getChannelInfo).toHaveBeenNthCalledWith(1, { slackAPI: expect.any(WebClient) });

  expect(fetchTopicsData).toHaveBeenNthCalledWith(1, {
    octokit: expect.any(Octokit),
    owner,
    repo,
    path,
  });

  expect(joinChannel).toHaveBeenNthCalledWith(1, {
    slackAPI: expect.any(WebClient),
    channel: 'asdfghjkl',
  });

  expect(setChannelTopic).toHaveBeenNthCalledWith(1, {
    slackAPI: expect.any(WebClient),
    channel: 'asdfghjkl',
    topic: 'asdfghjklasdfghjkl',
  });
  expect(sendNotification).toHaveBeenNthCalledWith(1, {
    slackAPI: expect.any(WebClient),
    channel: 'asdfghjkl',
    owner,
    repo,
  });
});
