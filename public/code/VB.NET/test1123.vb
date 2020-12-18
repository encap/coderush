client.query(
  q.Let(
    {
      lang: q.Get(q.Match(q.Index('languageByIndex'), languageIndex)),
      ref: q.Select(['ref'], q.Var('lang')),
      filesArr: q.Select(['data', 'files'], q.Var('lang')),
    },
    // q.Var('filesArr'),
    q.Update(q.Var('ref'), {
      data: {
        files: q.Append(q.Var('filesArr'), [submission]),
        // files: q.Var('filesArr'),

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