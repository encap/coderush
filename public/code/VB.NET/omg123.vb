
    - name: Install packages for code submission
      if: env.code_submission
      run: |
        npm install --no-package-lock --no-save @actions/core @actions/github faunadb
    - name: Accept code submission
      if: env.code_submission
      run: |
        node actions/add-code-submission-to-db.js
      env:
    - name: Install packages for code submission
      if: env.code_submission
      run: |
        npm install --no-package-lock --no-save @actions/core @actions/github faunadb
    - name: Accept code submission
      if: env.code_submission
      run: |
        node actions/add-code-submission-to-db.js
      env: