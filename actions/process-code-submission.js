// eslint-disable-next-line import/no-extraneous-dependencies
const core = require('@actions/core');

const fs = require('fs');

try {
  fs.readFile(process.env.GITHUB_EVENT_PATH, 'utf8', (err, data) => {
    if (err) {
      throw new Error(`ReadFile failed ${err.message}`);
    }
    const submission = JSON.parse(data).client_payload;

    core.info(JSON.stringify(submission, null, 2));

    core.startGroup('Validation');
    if (typeof submission === 'object' && submission.languageIndex < 40 && submission.name.length >= 2 && submission.author.length >= 2 && submission.tabSize % 2 === 0 && submission.lines >= 4) {
      core.endGroup();

      core.startGroup('Reading database.json');
      const stringifiedDatabase = fs.readFileSync('server/database.json', 'utf8');
      const database = JSON.parse(stringifiedDatabase);
      core.endGroup();

      const file = {
        name: submission.name,
        source: submission.author,
        lines: submission.lines,
        tabSize: submission.tabSize,
      };
      database.languages[submission.languageIndex].files.push(file);

      const languageName = database.languages[submission.languageIndex].name.replace('#', '_sharp');

      core.info(`Added "${submission.name}" to ${languageName}`);

      core.startGroup('Writing database.json');
      fs.writeFileSync('server/database.json', JSON.stringify(database, null, 2));
      core.endGroup();

      const { ext } = database.languages[submission.languageIndex];

      const filePath = `public/code/${languageName}/${submission.name}.${ext}`;

      core.startGroup('Removing trailing whitespace');
      const lines = submission.code.split('\n');
      const trimmedLines = languageName === 'Whitespace' ? lines : lines.map((line) => line.trimEnd());
      const code = trimmedLines.join('\n');
      core.endGroup();

      core.startGroup(`Writing ${filePath}`);
      fs.writeFileSync(filePath, code);
      core.endGroup();

      core.exportVariable('LANGUAGE_NAME', languageName);
      core.exportVariable('NAME', `${submission.name}.${ext}`);
      core.exportVariable('AUTHOR', submission.author);
      core.exportVariable('LINES', submission.lines);
    } else {
      core.endGroup();
      throw new Error('Invalid Submission!');
    }
  });
} catch (error) {
  core.setFailed(error.message);
}
