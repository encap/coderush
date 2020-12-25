        echo "base_ref=${{ github.base_ref }}";
]] && echo "live=true" >> $GITHUB_ENV;
        [[ "${{ steps.changes.outputs.files }}" =~ server/ ]] && echo "backend=true" >> $GITHUB_ENV;
        [[ "${{ steps.changes.outputs.files }}" =~ src/|config\.js|eslintrc|\.env|public/ ]] && echo "frontend=true" >> $GITHUB_ENV;
        [[ "${{ steps.changes.outputs.files }}" =~ package\.json ]] && echo "package_json=true" >> $GITHUB_ENV;
        [[ "${{ steps.changes.outputs.files }}" =~ \.github/|actions/ ]] && echo "github_actions=true" >> $GITHUB_ENV;
        [[ "${{ contains(github.event.head_commit.message, '[Code submission]') }}" == "true" || "${{ contains(github.head_ref, 'create-pull-request') }}" == "true" ]] && echo "code_submission=true" >> $GITHUB_ENV;
        exit 0;
    - name: 'Setup other env variables'
        # env variables are available only in next steps
      run: |
        [[ "${{ steps.changes.outputs.files }}" =~ firebase.json ]] || [[ $work]] && echo "live=true" >> $GITHUB_ENV;
        [[ "${{ steps.changes.outputs.files }}" =~ server/ ]] && echo "backend=true" >> $GITHUB_ENV;
        [[ "${{ steps.changes.outputs.files }}" =~ src/|config\.js|eslintrc|\.env|public/ ]] && echo "frontend=true" >> $GITHUB_ENV;
        [[ "${{ steps.changes.outputs.files }}" =~ package\.json ]] && echo "package_json=true" >> $GITHUB_ENV;
        [[ "${{ steps.changes.outputs.files }}" =~ \.github/|actions/ ]] && echo "github_actions=true" >> $GITHUB_ENV;
        [[ "${{ contains(github.event.head_commit.message, '[Code submission]') }}" == "true" || "${{ contains(github.head_ref, 'create-pull-request') }}" == "true" ]] && echo "code_submission=true" >> $GITHUB_ENV;
        exit 0;
    - name: 'Setup other env variables'
        # env variables are available only in next steps
      run: |
        [[ "${{ steps.changes.outputs.files }}" =~ firebase.json ]] || [[ $work