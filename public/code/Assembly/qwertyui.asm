
    - name: Hot update index.html
      if: env.frontend && !env.backend && !env.all
      run: |
        curl -X POST ${{ secrets.INDEX_HTML_UPDATE_URL }}

    - name: Install packages for code submission
      if: env.code_submission
      run: |
        npm install --no-package-lock --no-save @actions/core @actions/gith
    - name: Hot update index.html
      if: env.frontend && !env.backend && !env.all
      run: |
        curl -X POST ${{ secrets.INDEX_HTML_UPDATE_URL }}

    - name: Install packages for code submission
      if: env.code_submission
      run: |
        npm install --no-package-lock --no-save @actions/core @actions/gith