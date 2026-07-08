# CHANGELOG

## poseidon v8.0.0 - 2026.07.08 15
* refactor!: rename package from `@nuogz/hades` to `@danor-lib/hades`
* docs: **IMPORTANT!** update license to ***MIT***
* refactor!: rename `HadesOption`.`dirn` from `dir`
* refactor!: rename `HadesOption`.`numberFileLogBackupMax` from `numberFileLogBackup`
* refactor!: rename `HadesOption`.`willConsoleOutputError` from `willOutputConsoleError`
* refactor!: remove `HadesOption`.`willOutputLogDir`
* refactor!: remove infrequently used `@nuogz/i18n` and `@nuogz/utility`
* refactor: renew all codes
* docs: add README and English version
* docs: improve types and export
* docs: add error code reference table
* refactor!: due to a change in design philosophy, remove all error message text
  * in my design philosophy, an error should only contain a code and associated data. Text-based message should be rendered by the terminal (including i18n and terminal highlighting)
* regular!: bump up Node.js requirement to `>=26`
  * this requirement does not mean the library cannot run on older versions of Node.js. It only indicates the major version I am currently using
* regular: update enviroment
* regular: bump up dependencies


## v7.2.0 - 2025.04.18 10
* feat: new method on `Melinoe.what(what)`, which will return a new `Zagreus`
* docs: update docs
* chore: bump up dependencies
* chore: improve environment files


## v7.1.0 - 2024.08.27 09
* refactor: improve log format when show error
* docs: update locale
* deps: bump up dependencies
* chore: improve develop environments


## v7.0.2 - 2024.07.23 19
* refactor: use new translator function to output initialization log
* deps: bump up dependencies


## v7.0.1 - 2024.07.23 16
* feat: new formatter `valueTypeof`
* deps: bump up dependencies


## v7.0.0 - 2024.07.18 17
* refactor!: move `Hades` constructor params `name`, `level` `dirLog` into `HadesOption`
* refactor!: rename `HadesOption` `sizeFileLogMax` from `sizeLogFileMax`
* refactor!: rename environment variable `NENV_HADES_OPTIONS`, `NENV_HADES_NAME`, `NENV_HADES_LEVEL` INTO `NENV_HADES`
	* `NENV_HADES` is designed to use URL query string.
* feat: new `Hades` method `where` and `what` for preset `where` and `what` in same code scope
	* preset feature corresponds to new classes `Melinoe` and `Zagreus`
* feat: new `HadesOption`: `eol`, `templateTime`, `numberFileLogBackup`, `willColorfulLevel`, `willOutputConsoleError`
* refactor!: export Symbol `symbolLogUpdate` and `symbolLogDone` as a ESModule export now
	* remove class `Hades` member `symbolLogUpdate` and `symbolLogDone` 
* docs: better types
* refactor: renew all codes
* deps: bump up dependencies



## v6.3.1 - 2024.07.16 16
* revert: revert second delimiter in log format to `double space`


## v6.3.0 - 2024.07.16 11
* feat: hades now handles replacer when not highlighted.  
	* This allows the same text to be used in both highlighted and no-highlighted
* feat: new `i18next` formatter: `typeof`
* refactor: now `Hades` will add `i18next` formatters, no longer handled by `@nuogz/i18n`


## v6.2.0 - 2024.07.13 16
* refactor!: update some swtich options prefiex to `will` form `is`
* refactor: change delimiter in log format
* deps: bump up dependencies
* chore: improve develop environments


## v6.1.0 - 2023.12.07 13
* tweak enviroment
* bump up dependencies


## v6.0.3 - 2023.05.09 19
* fix `package.json`


## v6.0.2 - 2023.05.09 16
* fix `d.ts`


## v6.0.1 - 2023.05.09 16
* fix break code
* rename environment variable `NENV_HADES_FLAGS` from `NENV_HADES_OPTIONS`


## v6.0.0 - 2023.05.09 15
* use `Error.cause` to support output error chains
* new `ErrorCause` and `ErrorData` methods to be compatible with `Error.cause`
* bump up `@nuogz/i18n` to `v3.x` and renew related code
* add `d.ts` and renew related code
* bump up dependencies



## v5.2.0 - 2022.09.02 17
* rename environment variable `NENV_HADES_NAME` from `HADES_NAME`
* rename environment variable `NENV_HADES_LEVEL` from `HADES_DIR`
* rename environment variable `NENV_HADES_DIR` from `HADES_DIR`
* rename environment variable `NENV_HADES_OPTIONS` from `HADES_DIR`


## v5.1.0 - 2022.09.02 16
* resupport environment variable `HADES_NAME`
* rename environment variable `HADES_DIR` from `HADES_DIR_LOG`
* tweak project configs
* bump up dependencies


## v5.0.5 - 2022.08.12 10
* improve `locale` keys and translations
* bump up `@nuogz/i18n` to `1.2.0` and update related code


## v5.0.3 - 2022.08.09 15
* improve usage of i18n
* remove `localesSupport`
* improve `FileAppender.OptionHandleTypeError`


## v5.0.2 - 2022.08.09 08
* update repository url
* bump up `@nuogz/i18n` to `1.0.2`
* use unified `.eslintrc.cjs` from `@nuogz/pangu`
* use unified `.vscode/launch.json` from `@nuogz/pangu`


## v5.0.1 - 2022.08.08 20
* add `file` and `repository` option into `package.json`
* tweak `.eslintrc.cjs`


## v5.0.0 - 2022.08.08 19
* tweak all files for publishing to npm
* start use `CHANGLOG.md` since version `v5.0.0`
* use library `@nuogz/i18n` instead inline i18n code
* translate all inline documents info english
* bump up `chalk` to `v5.x`
