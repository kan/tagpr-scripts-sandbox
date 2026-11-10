/**
 * kan/tagpr-scripts の npm の publish の workflow（`publish-npm.yml`）を確かめるためのパッケージ。
 * 使うためのものではない。publish したものの中身が手元と同じかを、版の文字列で見分けられるように
 * するだけの関数を置く。
 */

/**
 * プレリリースの版（`1.2.3-rc.1` など）か。
 * @param {string} version
 * @returns {boolean}
 */
export function isPrerelease(version) {
  return /^\d+\.\d+\.\d+-/.test(version);
}
