const {
  spyOn,
  describe,
  beforeAll,
  afterAll,
  afterEach,
  expect,
  clearAllMocks,
  it,
} = require('jest');
const { setupServer } = require('msw/node');
const { rest } = require('msw');
const core = require('@actions/core');
const { Buffer } = require('node:buffer');

// const { fetchTopicsData } = require('./index.js');

const setInput = (name, value) =>
  (process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value);

setInput('SLACK_API_TOKEN', 'not a treal token. Just for tests.');

const coreSetFailedMock = spyOn(core, 'setFailed');
const coreDebugMock = spyOn(core, 'debug');

const server = setupServer(
  rest.get('https://api.github.com/repos/:owner/:repo/contents/:filePath', (req, res, ctx) => {
    // Customize the response based on your test case
    if (req.url.pathname.includes('successful')) {
      return res(
        ctx.status(200),
        ctx.json({
          content: Buffer.from('{"topic": "example-topic"}', 'utf-8').toString('base64'),
        })
      );
    } else if (req.url.pathname.includes('non200')) {
      return res(ctx.status(404));
    } else {
      return res(ctx.status(500));
    }
  })
);

describe('fetchTopicsData', () => {
  const { fetchTopicsData } = require('./index.js');

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    clearAllMocks();
  });
  afterAll(() => server.close());

  it('should fetch and parse topics data successfully', async () => {
    const owner = 'example-owner';
    const repo = 'example-repo';
    const filePath = 'example-file-path-successful';

    const result = await fetchTopicsData(owner, repo, filePath);

    expect(result).toEqual({ topic: 'example-topic' });
    expect(coreDebugMock).toHaveBeenCalledWith(
      'Making request',
      `GET /repos/${owner}/${repo}/contents/${filePath}`
    );
    expect(coreSetFailedMock).not.toHaveBeenCalled();
  });

  it('should handle non-200 response and call core.setFailed with error message', async () => {
    const owner = 'example-owner';
    const repo = 'example-repo';
    const filePath = 'example-file-path-non200';

    const result = await fetchTopicsData(owner, repo, filePath);

    expect(result).toBeUndefined();
    expect(coreDebugMock).toHaveBeenCalledWith(
      'Making request',
      `GET /repos/${owner}/${repo}/contents/${filePath}`
    );
    expect(coreSetFailedMock).toHaveBeenCalledWith(
      'Failed to retrieve topics data: Request failed with status code 404'
    );
  });

  it('should handle API error and call core.setFailed with error message', async () => {
    const owner = 'example-owner';
    const repo = 'example-repo';
    const filePath = 'example-file-path-error';

    const result = await fetchTopicsData(owner, repo, filePath);

    expect(result).toBeUndefined();
    expect(coreDebugMock).toHaveBeenCalledWith(
      'Making request',
      `GET /repos/${owner}/${repo}/contents/${filePath}`
    );
    expect(coreSetFailedMock).toHaveBeenCalledWith(
      `Error fetching topics data: Error: Request failed with status code 500`
    );
  });
});
