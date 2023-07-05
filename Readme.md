<a href="https://www.repostatus.org/#wip"><img src="https://www.repostatus.org/badges/latest/wip.svg" alt="Project Status: WIP - Initial development is in progress, but there has not yet been a stable, usable release suitable for the public." /></a>
<a href="https://project-types.github.io/#toy">
  <img src="https://img.shields.io/badge/project%20type-toy-blue" alt="Toy Badge"/>
</a>

This readme and repo is a WIP.
The readme may not reflect the current truth. Best of luck.

## How to run locally

Requirements:
- Docker
- [act](https://github.com/nektos/act)
- Slack app with the following permissions
  - channels:join
  - channels:read
  - channels:write.topic
  - chat:write
  - users:read
- GitHub API key. Public read-only personal token is fine.

To test, make sure your GitHub Action env includes `dryRun: true`.

Add your Slack API token to a `.env` file in the repo root.

Then, run: `$ act -j update-slack-topics`.

The Slack API Token will otherwise be stored as a "secret" for the repository where the Action will run.

## Limitations

- Will not correctly compare usernames of guest accounts or external users
- Will not correctly compare "special mentions"