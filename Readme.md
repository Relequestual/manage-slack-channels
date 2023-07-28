<a href="https://www.repostatus.org/#wip"><img src="https://www.repostatus.org/badges/latest/wip.svg" alt="Project Status: WIP - Initial development is in progress, but there has not yet been a stable, usable release suitable for the public." /></a>
<a href="https://project-types.github.io/#toy">
<img src="https://img.shields.io/badge/project%20type-toy-blue" alt="Toy Badge"/>
</a>
[![CI](https://github.com/Relequestual/manage-slack-channels/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/Relequestual/manage-slack-channels/actions/workflows/ci.yaml)

This readme and repo is a WIP.
The readme may not reflect the current truth. Best of luck.

## Useage

### Requirements:

- Slack app with the following permissions
  - channels:join
  - channels:read
  - channels:write.topic
  - chat:write
  - users:read
- Store the Slack API token as a secret in the repo where this workflow runs. It must be named `SLACK_API_TOKEN`

### Setup

Copy the following YAML code into a new workflow file in `./github/workflows`.
Modify as required.

Once run, check the log for output. If you're happy, remove the `dryRun` line in the config.
Including `workflow_dispatch` means you may manually run this if required.

If you require changing the schedule, check [GitHub Action Workflow trigger event documentation](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule).

```yaml
name: Managed Slack Topics

on:
  schedule:
    - cron: '5 1 * * *' # POSIX cron syntax
  push:
    branches:
      - main
  workflow_dispatch

jobs:
  update-slack-topics:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        name: Checkout the action
      - uses: ./
        with:
          SLACK_API_TOKEN: ${{ secrets.SLACK_API_TOKEN }}
          GITHUB_TOKEN: ${{ github.token }}
          owner: [GITHUB OWNER of the repo]
          repo: [REPO NAME]
          path: [PATH TO JSON FILE IN REPO]
          dryRun: true
```

## How to run locally for development or testing

Additional requirements:

- Docker
- [act](https://github.com/nektos/act)
- GitHub API token. Personal access token, read only, is fine.

To test, make sure your GitHub Action env includes `dryRun: true`.

Add your Slack API token and GitHub API token to a `.env` file in the repo root.

Copy the example action configuration to a file at `.github/workflows/update-slack-topics.yaml`.
Then, run: `$ act -j update-slack-topics --secret-file .env`.

Modify the GitHub token to be `secrets.GITHUB_TOKEN` in the workflow file.

Modify `action.yml` in the root directory so that the last block's run property is set to `node src/index.js`. The production version of the `action.yml` file must point to the distribution compiled version of this code (`dist/index.js`). (Maybe there's a way round this. Let me know if you know.)

## Limitations

- Will not correctly compare usernames of guest accounts or external users
- Will not correctly compare "[special mentions](https://api.slack.com/reference/surfaces/formatting#special-mentions)"

## Contributions

Sure, please do!. I'll review as and when I have time.
Be nice. Thanks.
