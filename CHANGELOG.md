# Changelog

## [Unreleased]

## [0.1.10] - 2026-11-12

- 共通の npm の publish の workflow が `npm stage publish` で stage し、approve で公開されることを確かめる（kan/tagpr-scripts#15）

## [0.1.9] - 2026-11-10

- 出すものが無い run が draft のリリース PR を閉じ、次の項目で新しいリリース PR ができることを確かめる（kan/tagpr-scripts#14）
- @kanf/sandbox として、共通の npm の publish の workflow で npm へ出す（kan/tagpr-scripts#15）

## [0.1.8] - 2026-11-07

- 取り消されたマージの run を、次の run が再実行してタグを打たせることを確かめる（kan/tagpr-scripts#4）

## [0.1.7] - 2026-11-07

- リリース PR に tagpr:minor を付け外しすると作り直されることを確かめる（kan/tagpr-scripts#3）

## [0.1.6] - 2026-11-07

- 出すものが無い push では tagpr を飛ばし、項目を足すとリリース PR ができることを確かめる（kan/tagpr-scripts#13）

## [0.1.5] - 2026-11-07

- 成功した run が、前のリリース PR を閉じ、今のリリース PR だけを ready に戻すことを確かめる（kan/tagpr-scripts#11）

## [0.1.4] - 2026-11-05

- 落ちた run のリリース PR を draft にし、タグを annotated にすることを確かめる

## [0.1.3] - 2026-11-05

- 前のジョブが落ちても、マージの run がタグを打つことを確かめる

## [0.1.1] - 2026-11-05

- 共通の tagpr workflow を呼ぶ形で、最初のリリースを作る

[0.1.10]: https://github.com/kan/tagpr-scripts-sandbox/releases/tag/v0.1.10
[0.1.9]: https://github.com/kan/tagpr-scripts-sandbox/releases/tag/v0.1.9
[0.1.8]: https://github.com/kan/tagpr-scripts-sandbox/releases/tag/v0.1.8
[0.1.7]: https://github.com/kan/tagpr-scripts-sandbox/releases/tag/v0.1.7
[0.1.6]: https://github.com/kan/tagpr-scripts-sandbox/releases/tag/v0.1.6
[0.1.5]: https://github.com/kan/tagpr-scripts-sandbox/releases/tag/v0.1.5
[0.1.4]: https://github.com/kan/tagpr-scripts-sandbox/releases/tag/v0.1.4
[0.1.3]: https://github.com/kan/tagpr-scripts-sandbox/releases/tag/v0.1.3
[0.1.1]: https://github.com/kan/tagpr-scripts-sandbox/releases/tag/v0.1.1
