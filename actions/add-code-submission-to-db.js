/* eslint-disable import/no-extraneous-dependencies */
const core = require('@actions/core');
const github = require('@actions/github');

const faunadb = require('faunadb');


const main = async () => {
  core.startGroup('Get PR body');

  const { context } = github;

  const octokit = github.getOctokit(process.env.TOKEN);

  const { data } = await octokit.repos.listPullRequestsAssociatedWithCommit({
    owner: context.repo.owner,
    repo: context.repo.repo,
    commit_sha: context.sha,
  });

  const prBody = data[0].body;

  core.endGroup();

  core.startGroup('Parse PR body');

  const lines = prBody.trim().split('\n');

  const json = lines.map((line, index) => {
    const [name, value] = line.split(':');
    const nameParsed = name.trim().charAt(0).toLowerCase() + name.trim().slice(1);

    return `"${nameParsed === 'author' ? 'source' : nameParsed}": ${value.trim()}${index + 1 === lines.length ? '' : ','}`;
  }).join('\n');

  console.log(json);

  const submission = JSON.parse(`{${json}}`);
  console.log(submission);

  core.endGroup();


  const { language } = submission;

  delete submission.language;

  core.startGroup('Establish connection with faunaDB');
  const q = faunadb.query;
  const client = new faunadb.Client({ secret: context.secrets.FAUNA_KEY });
  core.endGroup();

  core.startGroup('Add file entry to database');
  client.query(
    q.Let(
      {
        ref: q.Match(q.Index('languageByIndex'), language.index),
        lang: q.Get(q.Var('ref')),
        filesArr: q.Select(['data', 'files'], q.Var('lang')),
      },
      q.Update(q.Var('ref'), {
        data: {
          files: q.Append(q.Select(['data', 'files'], q.Var('lang')), submission),
        },
      }),
    ),
  )
    .then((ret) => {
      debugger;
      core.endGroup();
      console.log(JSON.stringify(ret, null, 2));
    });
};

main().catch((err) => core.setFailed(err.message));
