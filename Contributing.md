# How to release

- Create a tag and push it
- Start build [on Jenkins CI](https://dev-platform-jenkins.rhev-ci-vms.eng.rdu2.redhat.com/view/VS%20Code/job/vscode-wsdl2rest-release/) with _publishToMarketPlace_ parameter checked
- Wait that the build is waiting on step _Publish to Marketplace_
  - The vsix is downloadable and can be tested a last time before publishing it to public
  - Go to the console log of the build and click "Approve"
- Wait few minutes and check that it has been published on [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-wsdl2rest)
- Keep build forever for later reference and edit build information to indicate the version
- Update package.json and Changelog.md with next version to prepare for new iteration release (via a Pull Request)