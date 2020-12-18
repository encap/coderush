// eslint-disable-nsubmission.language.ext-line import/no-submission.language.extraneous-dependencies
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
    if (typeof submission === 'object' && submission.language.index < 40 && submission.name.length >= 2 && submission.author.length >= 2 && submission.tabSize % 2 === 0 && submission.lines >= 4) {
      core.endGroup();

      core.info(`Added "${submission.name}" to ${submission.language.name}`);

      const filePath = `public/code/${submission.language.name.replace('#', '_sharp')}/${submission.name}.${submission.language.ext}`;

      core.startGroup('Removing trailing whitespace');
      const lines = submission.code.split('\n');
      const trimmedLines = submission.language.name === 'Whitespace' ? lines : lines.map((line) => line.trimEnd());
      const code = trimmedLines.join('\n');
      core.endGroup();

      core.startGroup(`Writing ${filePath}`);
      fs.writeFileSync(filePath, code);
      core.endGroup();

      core.exportVariable('LANGUAGE_INDEX', submission.language.index);
      core.exportVariable('LANGUAGE_NAME', submission.language.name);
      core.exportVariable('NAME', submission.name);
      core.exportVariable('EXT', submission.language.ext);
      core.exportVariable('AUTHOR', submission.author);
      core.exportVariable('LINES', submission.lines);
      core.exportVariable('TAB_SIZE', submission.tabSize);
    } else {
      core.endGroup();
      throw new Error('Invalid Submission!');
    }
  });
} catch (error) {
  core.setFailed(error.message);
}
