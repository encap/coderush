
        node actions/add-code-submission-to-db.js
      env:
        TOKEN: ${{ secrets.GITHUB_TOKEN }}
        FAUNA_KEY: ${{ secrets.FAUNA_DEV_KEY }}


      # heroku will auto deploy pull request
    - name: 'Remove unnecessary files'
      if: env.live && (env.backend || env.all)
      run: |
        shopt -s extglob
        rm -rfdv !("server"|"package.json"|"Procfile")
    - name: Push backend to Heroku
        node actions/add-code-submission-to-db.js
      env:
        TOKEN: ${{ secrets.GITHUB_TOKEN }}
        FAUNA_KEY: ${{ secrets.FAUNA_DEV_KEY }}


      # heroku will auto deploy pull request
    - name: 'Remove unnecessary files'
      if: env.live && (env.backend || env.all)
      run: |
        shopt -s extglob
        rm -rfdv !("server"|"package.json"|"Procfile")
    - name: Push backend to Heroku