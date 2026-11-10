/**
 * **publish の前に、タグを確かめる**（共通の workflow `publish-npm.yml` の build のジョブ）。
 * **repo のルートで、タグを checkout した状態で実行する。**
 *
 *     node scripts/tagpr/release-tag.mjs v1.2.4 >> "$GITHUB_OUTPUT"
 *
 * 次のどれかなら exit 1。
 *
 * - タグが `v` + `package.json` の版でない。ずれたまま出すと、違う版が publish されるか、
 *   「同じ版は出せない」で落ちて、どちらも原因をタグ名から読めない
 * - `.tagpr` に `releaseBranch` が無い
 * - タグの commit（`HEAD`）が `origin/<releaseBranch>` の上に無い。手でほかのブランチに打った
 *   タグを出さない。`origin/<releaseBranch>` を読むので、履歴ごと checkout しておく
 *
 * 通れば、GitHub Actions の出力の形で次の 2 行を出す。
 *
 * - `prerelease=true|false`: プレリリースのタグか（`isPrereleaseTag`。`release-notes.mjs` と同じ規則）
 * - `spec=<name>@<version>`: npm にもうあるかを確かめるための名前と版
 *
 * **Node の組み込みしか使わない**（ほかのスクリプトと同じ）。npm ci より前に走らせるため。
 */
import { spawnSync } from 'node:child_process';
import { relative } from 'node:path';
import { ReleaseError, isPrereleaseTag, readRootFile, tagprConfig } from './changelog.mjs';

/**
 * @param {string} tag
 * @returns {{ prerelease: boolean, spec: string }}
 */
function checkTag(tag) {
  let pkg;
  try {
    pkg = JSON.parse(readRootFile('package.json'));
  } catch (e) {
    if (!(e instanceof SyntaxError)) throw e;
    throw new ReleaseError(`package.json is not valid JSON: ${e.message}`);
  }
  if (tag !== `v${pkg.version}`) {
    throw new ReleaseError(`The tag ${tag} does not match version ${pkg.version} of package.json`);
  }
  const branch = tagprConfig('releaseBranch');
  if (!branch) throw new ReleaseError('.tagpr has no tagpr.releaseBranch');
  const r = spawnSync('git', ['merge-base', '--is-ancestor', 'HEAD', `origin/${branch}`], { encoding: 'utf8' });
  if (r.error) throw r.error;
  // 1 は祖先でない。ほかの非 0（origin/<branch> が無いなど）は git のエラー
  if (r.status === 1) throw new ReleaseError(`The commit of ${tag} is not on ${branch}`);
  if (r.status !== 0) {
    throw new ReleaseError(`Cannot see whether ${tag} is on ${branch} (fetch the whole history): ${r.stderr.trim()}`);
  }
  return { prerelease: isPrereleaseTag(tag), spec: `${pkg.name}@${pkg.version}` };
}

const tag = process.argv[2];
if (!tag) {
  // 取り込み先では repo のルートから見たパス（`scripts/tagpr/release-tag.mjs`）になる
  console.error(`usage: node ${relative(process.cwd(), import.meta.filename)} <tag>`);
  process.exit(1);
}
try {
  const { prerelease, spec } = checkTag(tag);
  console.log(`prerelease=${prerelease}`);
  console.log(`spec=${spec}`);
} catch (e) {
  if (!(e instanceof ReleaseError)) throw e;
  console.error(e.message);
  process.exit(1);
}
