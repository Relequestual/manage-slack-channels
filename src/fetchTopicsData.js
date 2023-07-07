// const { Buffer } = require('node:buffer');
const core = require('@actions/core');

module.exports.fetchTopicsData = async function fetchTopicsData({ octokit, owner, repo, path }) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      mediaType: {
        format: 'raw',
      },
      owner,
      repo,
      path,
    });

    return JSON.parse(data);
  } catch (error) {
    core.setFailed(`Error fetching topics data: ${error}`);
    return;
  }
};
