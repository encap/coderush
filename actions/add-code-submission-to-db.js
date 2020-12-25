/* eslint-disable import/no-extraneous-dependencies */
const core = require('@actions/core');
const github = require('@actions/github');

const faunadb = require('faunadb');


const main = async () => {
  core.startGroup('Get PR body');

  const { context } = github;

  console.log(`Commit: "${context.sha}`);
  console.log(JSON.stringify(context));

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
    const quoteValue = nameParsed === 'name' || nameParsed === 'author';
    const parsedValue = `${quoteValue ? '"' : ''}${value.trim()}${quoteValue ? '"' : ''}`;

    return `"${nameParsed === 'author' ? 'source' : nameParsed}": ${parsedValue}${index + 1 === lines.length ? '' : ','}`;
  }).join('\n');

  console.log(json);

  const submission = JSON.parse(`{${json}}`);
  console.log(submission);

  core.endGroup();


  const { languageIndex } = submission;

  delete submission.languageIndex;

  core.startGroup('Establish connection with faunaDB');
  const q = faunadb.query;
  const client = new faunadb.Client({ secret: process.env.FAUNA_KEY });
  core.endGroup();

  core.startGroup('Add file entry to database');
  client.query(
    q.Let(
      {
        lang: q.Get(q.Match(q.Index('languageByIndex'), languageIndex)),
        ref: q.Select(['ref'], q.Var('lang')),
        filesArr: q.Select(['data', 'files'], q.Var('lang')),
      },
      q.Update(q.Var('ref'), {
        data: {
          files: q.Append([submission], q.Var('filesArr')),
        },
      }),
    ),
  )
    .then((ret) => {
      console.log(JSON.stringify(ret, null, 2));
    })
    .catch((err) => {
      console.log(JSON.stringify(err, null, 2));
      throw err;
    });
};

main().catch((err) => core.setFailed(err.message));
