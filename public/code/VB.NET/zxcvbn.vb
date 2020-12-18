t nameParsed = name.trim().charAt(0).toLowerCase() + name.trim().slice(1);
    const quoteValue = nameParsed === 'name' || nameParsed === 'author';
    const parsedValue = `${quoteValue ? '"' : ''}${value.trim()}${quoteValue ? '"' : ''}`;

    return `"${nameParsed === 'author' ? 'source' : nameParsed}": ${parsedValue}${index + 1 === lines.length ? '' : ','}`;
  }).join('\n');

  console.log(json);

  const submission = JSON.parse(`{${json}}`);
  console.log(submission);t nameParsed = name.trim().charAt(0).toLowerCase() + name.trim().slice(1);
    const quoteValue = nameParsed === 'name' || nameParsed === 'author';
    const parsedValue = `${quoteValue ? '"' : ''}${value.trim()}${quoteValue ? '"' : ''}`;

    return `"${nameParsed === 'author' ? 'source' : nameParsed}": ${parsedValue}${index + 1 === lines.length ? '' : ','}`;
  }).join('\n');

  console.log(json);

  const submission = JSON.parse(`{${json}}`);
  console.log(submission);