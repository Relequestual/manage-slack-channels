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
  const mockChannelNames = Object.values(mockChannelInfo).map(({ name }) => name);
  const mockTopicData = {
    qwertyuiop: { topic: 'qwertyuiop' },
    asdfghjkl: { topic: 'asdfghjklasdfghjkl' },
  };
  const mockTopicChannels = Object.keys(mockTopicData);

  getChannelInfo.mockResolvedValueOnce(mockChannelInfo);
  fetchTopicsData.mockResolvedValueOnce(mockTopicData);
  fetchTopicsData.mockResolvedValueOnce(true);
  sendNotification.mockResolvedValueOnce(true);

  await run({ owner, repo, path, dryRun, githubToken, slackAPIToken });

  expect(core.debug).toHaveBeenNthCalledWith(1, 'owner', owner);
  expect(core.debug).toHaveBeenNthCalledWith(2, 'repo', repo);
  expect(core.debug).toHaveBeenNthCalledWith(3, 'path', path);
  expect(core.debug).toHaveBeenNthCalledWith(4, 'dryRun', dryRun);

  expect(getChannelInfo).toHaveBeenNthCalledWith(1, { slackAPI: expect.any(WebClient) });

  expect(core.info).toHaveBeenNthCalledWith(1, 'Starting channel topic updates.');

  expect(core.info).toHaveBeenNthCalledWith(2, 'Found channel(s):', ...mockChannelNames);

  expect(fetchTopicsData).toHaveBeenNthCalledWith(1, {
    octokit: expect.any(Octokit),
    owner,
    repo,
    path,
  });

  expect(core.info).toHaveBeenNthCalledWith(
    3,
    'Found topic data for channel(s):',
    ...mockTopicChannels
  );

  expect(core.info).toHaveBeenNthCalledWith(
    4,
    'Comparing topics. GitHub: qwertyuiop. Slack: qwertyuiop'
  );

  expect(core.info).toHaveBeenNthCalledWith(5, 'Joining channel asdfghjkl (asdfghjkl)');
  expect(joinChannel).toHaveBeenNthCalledWith(1, {
    slackAPI: expect.any(WebClient),
    channel: 'asdfghjkl',
  });
  expect(core.info).toHaveBeenNthCalledWith(
    6,
    'Comparing topics. GitHub: asdfghjklasdfghjkl. Slack: asdfghjkl'
  );
  expect(core.info).toHaveBeenNthCalledWith(
    7,
    'Changing topic for channel asdfghjkl to asdfghjklasdfghjkl'
  );
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
  expect(core.info).toHaveBeenNthCalledWith(8, 'Changed topic and notified asdfghjkl');

  expect(core.info).toHaveBeenNthCalledWith(9, 'Channel topic updates completed.');
});
