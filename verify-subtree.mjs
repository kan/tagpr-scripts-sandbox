/**
 * **取り込んだ `scripts/tagpr/` と、共通の workflow を呼ぶ行の SHA が揃っているかを確かめる。**
 * 取り込み先の CI（pull request で走るもの）から、**repo のルートで実行する。**
 *
 *     node scripts/tagpr/verify-subtree.mjs
 *
 * subtree の squash は、取り込んだ commit の tree をそのまま `scripts/tagpr/` に置く。そこで
 * `HEAD:scripts/tagpr` の tree と、`.github/workflows/` にある
 * `uses: kan/tagpr-scripts/.github/workflows/tagpr.yml@<SHA>` の commit の tree を比べる。
 * 次のどれでも落ちる。
 *
 * - subtree を取り込んだのに、呼ぶ行の SHA を上げ忘れた
 * - 呼ぶ行の SHA だけを上げて、subtree を取り込み忘れた
 * - `scripts/tagpr/` を取り込み先で手で編集した
 *
 * 呼ぶ行も `scripts/tagpr/` も、commit した内容（`HEAD`）から読む。作業ツリーの変更は見ない。
 * subtree の置き場所は、このファイルの置き場所から決める。
 *
 * 呼ぶ行の commit は、一時の bare repo へ深さ 1 で取ってくる。取り込み先の clone を浅くせず、
 * squash のコミットを探すために履歴を深く取る必要も無い。公開の repo なのでトークンも要らない。
 *
 * **Node の組み込みしか使わない**（ほかのスクリプトと同じ）。
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { ReleaseError } from './changelog.mjs';

const workflowsDir = '.github/workflows';
// テストが手元の repo に差し替える。CI では設定しない
const upstreamUrl = process.env.TAGPR_SCRIPTS_URL || 'https://github.com/kan/tagpr-scripts.git';
const usesPattern = /uses:\s*["']?kan\/tagpr-scripts\/\.github\/workflows\/tagpr\.yml@([^\s"'#]+)/g;

function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new ReleaseError(`git ${args.join(' ')} failed:\n${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

/** HEAD の `.github/workflows/*.yml` から、共通の workflow を呼ぶ行の SHA を集める（ファイルごと） */
function pinnedShas() {
  const paths = git(['ls-tree', '--name-only', `HEAD:${workflowsDir}`])
    .split('\n')
    .filter((name) => /\.ya?ml$/.test(name))
    .map((name) => `${workflowsDir}/${name}`);
  const pins = [];
  for (const path of paths) {
    for (const m of git(['show', `HEAD:${path}`]).matchAll(usesPattern)) pins.push({ path, ref: m[1] });
  }
  return pins;
}

/** tagpr-scripts の commit の tree を、一時の bare repo に取ってきて読む */
function upstreamTree(sha) {
  const dir = mkdtempSync(join(tmpdir(), 'tagpr-scripts-'));
  try {
    git(['init', '-q', '--bare', dir]);
    git(['-C', dir, 'fetch', '-q', '--depth=1', upstreamUrl, sha]);
    return git(['-C', dir, 'rev-parse', `${sha}^{tree}`]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

try {
  // subtree の置き場所（取り込み先では `scripts/tagpr`）。git のパスは `/` で区切る
  const prefix = relative(process.cwd(), import.meta.dirname).split(sep).join('/');
  if (prefix === '' || prefix.startsWith('..')) {
    throw new ReleaseError(
      `run this from the root of a repository that pulls in tagpr-scripts (got: ${process.cwd()})`,
    );
  }

  const pins = pinnedShas();
  if (pins.length === 0) {
    throw new ReleaseError(`no "uses: kan/tagpr-scripts/.github/workflows/tagpr.yml@<SHA>" in ${workflowsDir}`);
  }
  for (const { path, ref } of pins) {
    if (!/^[0-9a-f]{40}$/.test(ref)) {
      throw new ReleaseError(`${path}: pin kan/tagpr-scripts to a full commit SHA, not "${ref}"`);
    }
  }
  const shas = [...new Set(pins.map((p) => p.ref))];
  if (shas.length > 1) {
    throw new ReleaseError(
      `the workflows call kan/tagpr-scripts at different commits:\n${pins.map((p) => `  ${p.path}: ${p.ref}`).join('\n')}`,
    );
  }
  const [sha] = shas;

  const local = git(['rev-parse', `HEAD:${prefix}`]);
  const upstream = upstreamTree(sha);
  if (local !== upstream) {
    throw new ReleaseError(
      [
        `${prefix}/ does not match kan/tagpr-scripts@${sha}, the commit the workflows call.`,
        `  HEAD:${prefix}      tree ${local}`,
        `  tagpr-scripts@${sha.slice(0, 12)}  tree ${upstream}`,
        'Pull the subtree and move the "uses:" line to the same commit (README "Changing it"),',
        `and do not edit ${prefix}/ by hand.`,
      ].join('\n'),
    );
  }
  console.log(`${prefix}/ matches kan/tagpr-scripts@${sha} (tree ${local})`);
} catch (e) {
  if (!(e instanceof ReleaseError)) throw e;
  console.error(e.message);
  process.exit(1);
}
