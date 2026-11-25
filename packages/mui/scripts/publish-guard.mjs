/**
 * prepublishOnly에서 호출하는 가드다.
 *
 * 실제 npm publish는 v* 태그 push로 실행되는 GitHub Actions(.github/workflows/release.yml)에서만 허용한다.
 * 그 workflow는 trusted publishing(OIDC)과 provenance를 쓰므로, 로컬 publish는 의도와 무관하게 막는다.
 * `npm publish --dry-run`은 패키지 내용 확인용이라 허용한다.
 */
const env = process.env;

const isDryRun = env.npm_config_dry_run === 'true';
const isTagWorkflow = env.GITHUB_ACTIONS === 'true' && env.GITHUB_REF_TYPE === 'tag';

if (!isDryRun && !isTagWorkflow) {
  console.error(
    '[MUI_REACT19_PUBLISH_DIRECT_DENIED] 로컬 npm publish는 허용하지 않습니다. ' +
      'main에 버전 커밋을 push한 뒤 v<버전> 태그를 push하면 GitHub Actions가 배포합니다.',
  );
  process.exit(1);
}
