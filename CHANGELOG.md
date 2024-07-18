# CHANGELOG

## v7.0.0 - 2024.07.18 17
* refactor!: Move `Hades` constructor params `name`, `level` `dirLog` into `HadesOption`
* refactor!: Rename `HadesOption` `sizeFileLogMax` from `sizeLogFileMax`
* refactor!: Rename environment variable `NENV_HADES_OPTIONS`, `NENV_HADES_NAME`, `NENV_HADES_LEVEL` info `NENV_HADES`
	* `NENV_HADES` is designed to use URL query string.
* feat: Bew `Hades` method `where` and `what` for preset `where` and `what` in same code scope
	* Preset feature corresponds to new classes `Melinoe` and `Zagreus`
* feat: Bew `HadesOption`: `eol`, `templateTime`, `numberFileLogBackup`, `willColorfulLevel`, `willOutputConsoleError`
* refactor!: Export Symbol `symbolLogUpdate` and `symbolLogDone` as a ESModule export now
	* Remove class `Hades` member `symbolLogUpdate` and `symbolLogDone` 
* docs: Better types
* refactor: Renew all codes
* build: Bump up dependencies



## v6.3.1 - 2024.07.16 16
* revert: Revert second delimiter in log format to `double space`


## v6.3.0 - 2024.07.16 11
* feat: Hades now handles replacer when not highlighted.  
	* This allows the same text to be used in both highlighted and no-highlighted
* feat: New `i18next` formatter: `typeof`
* refactor: Now `Hades` will add `i18next` formatters, no longer handled by `@nuogz/i18n`


## v6.2.0 - 2024.07.13 16
* refactor!: Update some swtich options prefiex to `will` form `is`
* refactor: Change delimiter in log format
* build: Bump up dependencies
* chore: Improve develop environments


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
