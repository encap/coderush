ew Error(`ReadFile failed ${err.message}`);
    }
    const submission = JSON.parse(data).client_payload;

    core.info(JSON.stringify(submission, null, 2));

    core.startGroup('Validation');
    if (typeof submission === 'object' && submission.language.index < 40 && submission.name.length >= 2 && submission.author.length >= 2 && submission.tabSize % 2 === 0 && submission.lines >= 4) {
      core.endGroup();
ew Error(`ReadFile failed ${err.message}`);
    }
    const submission = JSON.parse(data).client_payload;

    core.info(JSON.stringify(submission, null, 2));

    core.startGroup('Validation');
    if (typeof submission === 'object' && submission.language.index < 40 && submission.name.length >= 2 && submission.author.length >= 2 && submission.tabSize % 2 === 0 && submission.lines >= 4) {
      core.endGroup();
