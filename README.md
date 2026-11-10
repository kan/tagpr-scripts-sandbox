# tagpr-scripts-sandbox

kan/tagpr-scripts の reusable workflow（`.github/workflows/tagpr.yml`、`tagpr-label.yml`、
`publish-npm.yml`）を、別の repo から呼んで確かめるための repo（kan/tagpr-scripts#6、#15）。

npm に [@kanf/sandbox](https://www.npmjs.com/package/@kanf/sandbox) として出す。これも
`publish-npm.yml` を確かめるためのパッケージで、使うためのものではない。npmjs.com の Trusted
Publisher には `.github/workflows/publish.yml` を登録してある。
