const core = require('@actions/core');

const { run } = require('./run');

const githubToken = core.getInput('GITHUB_TOKEN', { required: true });
const slackAPIToken = core.getInput('SLACK_API_TOKEN', { required: true });

const owner = core.getInput('owner', { required: true });
const repo = core.getInput('repo', { required: true });
const path = core.getInput('path', { required: true });
const dryRun = core.getBooleanInput('dryRun', { default: false });

run({ githubToken, slackAPIToken, owner, repo, path, dryRun });
