# Interactive Brokers Analyzer

![Interactive Brokers](https://img.shields.io/badge/Interactive%20Brokers-111111?style=for-the-badge&logo=data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB3aWR0aD0iMTJtbSIKICAgaGVpZ2h0PSIxOC4yMjQzOW1tIgogICB2aWV3Qm94PSIwIDAgMTAgMTguMjI0MzkiCiAgIHZlcnNpb249IjEuMSI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLTEsMCwwLDEsMzg5NC4yNDQ2LDApIgogICAgICAgeTI9IjQ5LjAwMDgwMSIKICAgICAgIHgyPSIzODkzLjM4ODciCiAgICAgICB5MT0iNDkuMDAwODAxIgogICAgICAgeDE9IjM4NjQuOTgxNyIKICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIgogICAgICAgaWQ9ImdyYWQiPgogICAgICA8c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojRDgxMjIyIgogICAgICAgICBvZmZzZXQ9IjAiIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIHN0eWxlPSJzdG9wLWNvbG9yOiM5NjBCMUEiCiAgICAgICAgIG9mZnNldD0iMSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxnCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTMuMDgyODMyLC0xNzEuNDcxMTQpIj4KICAgICAgPHBvbHlnb24KICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC4yNjQ1ODMzMywwLDAsMC4yNjQ1ODMzMywtMTIuODIwOTU3LDE3MS44Mzg4NSkiCiAgICAgICAgIHN0eWxlPSJmaWxsOnVybCgjZ3JhZCkiCiAgICAgICAgIGNsYXNzPSJzdDEiCiAgICAgICAgIHBvaW50cz0iMC45LDY0LjYgMC45LDMzLjQgMjkuMyw2NC42ICIgLz4KICAgICAgPGNpcmNsZQogICAgICAgICBzdHlsZT0iZmlsbDojZDgxMjIyO3N0cm9rZS13aWR0aDowLjI2NDU4MzMyIgogICAgICAgICBjbGFzcz0ic3QyIgogICAgICAgICBjeD0iLTYuMTI2OTgzNiIKICAgICAgICAgY3k9IjE4Mi42ODY3OCIKICAgICAgICAgcj0iMi4yNDg5NTgzIiAvPgogICAgICA8cG9seWdvbgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjI2NDU4MzMzLDAsMCwwLjI2NDU4MzMzLC0xMi44MjA5NTcsMTcxLjgzODg1KSIKICAgICAgICAgc3R5bGU9ImZpbGw6I2Q4MTIyMiIKICAgICAgICAgY2xhc3M9InN0MiIKICAgICAgICAgcG9pbnRzPSIwLjksMzMuNCAwLjksNjQuNiAyOS4zLDAuNSAiCiAgICAgICAgICAvPgogIDwvZz4KPC9zdmc+Cg==) ![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![Eslint](https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E) ![Github Actions](https://img.shields.io/badge/Github%20Actions-282a2e?style=for-the-badge&logo=githubactions&logoColor=367cfe)
![CI badge](https://github.com/fs-public/ib-analyzer/actions/workflows/ci.yml/badge.svg) ![Repo Size](https://img.shields.io/github/repo-size/fs-public/ib-analyzer)

NodeJS utility to parse and analyze [Interactive Brokers](https://www.interactivebrokers.com/) (stock trading platform, IB) trade reports from the POV of the local (Czech Republic) tax authority.

In Czech Republic, capital gains are:

-   Taxed 15 %,
-   Matched in a first-in-first-out (FIFO) fashion,
-   Losses offset gains in full within one tax year (and cannot be carried over), and
-   Capital gains or losses realized after 3 years or more are fully exempt (neither tax obligation required nor offset possible).
-   All securities (stocks, bonds, derivatives, ...) are taxed together for as long as they have an ISIN.
-   Currency exchanges are not taxed (when exchanged for personal consumption or primarily for security purchases, only Forex trading with the goal of profit solely off the Forex trading would be taxed).

The application matches your trades based on these rules, computes tax obligation to cross-check your tax accountant, and suggests possible tax loss harvests and coming-up 3-year exemptions. Short sells and derivatives are supported as well.

The application has been used on Central Europe (IBCE) and Ireland (IBIE) offices and is being maintained at least on a yearly basis for IBIE.

**Features**

-   Imports CSV exports from Interactive Brokers, with architecture that is easily extendable for other platforms & future-proofed for IB schema changes.
-   Validates loaded data, cross-checks calculations on dependent columns between the app and the source.
-   Displays statistics and various views for further analysis in the terminal, such as realized tax and possible tax optimizations.
-   Exports all views into CSV and PDF files.

### Installation

The project is not published on _npm_. Please pull the source to a local directory, then run the following command.

```bash
npm install
```

After dependencies are installed, simply run `npm run build` for a one-time build or `npm run watch` for real-time compilation.

Analysis launches with npm script `npm start`. For configuration, see the [Usage section](#Usage).

### Technology

The project runs with `npm` and `node` and is written in Typescript. Uses `ajv`, `dotenv`, `lodash`, and `moment` for logic and `csv`, `html-pdf`, and `handlebars` for file I/O. Code quality assured by `prettier` and `eslint` and enforced by `Github Actions`. `Jest` test cases will be developed in future versions.

The application sequentially executes the following steps:

1. (`./src/process/1-loader.ts`) Data CSVs are loaded into memory and reschemed based on the configuration file. CSV validity under the scheme is checked.
2. (`./src/process/2-parseOrders.ts`) Relevant rows are parsed into orders, matched with multipliers, and saved in typed objects. Multipliers are validated.
3. (`./src/process/3-matchFills`) Orders are matched against themselves to find full and partial fills, as well as unfilled orders (_by fills we understand decreasing outstanding holdings, i.e. fills against oneself; not partial fulfillment of the orders on the market_). IB reports profits/losses (P&L) for closing orders, which is validated against self-computed P&L.
4. Application loop is ran, allowing to reload data, display issues, and show various views (see [Running the Analysis](#3-running-the-analysis) section) through an interactive wizard.

Furthermore, throughout steps 1-3, more validations are executed by separated validator functions in `./src/process/validator.ts`, including unrecognized or unsupported values, incorrect/unexpected computations on IB side, sorting, and unmatched orders.

### Usage

#### 1. Data

Within Interactive Brokers, navigate to reports and export arbitrary time-ranges with the _Activity_ preset to CSV and PDF (_the PDF variants are suggested for manual cross-checking of the data sources, as the size grows fast with many trades and years of trading history_).

For correct functionality, it is crucial to export from the beginning of trading history. Otherwise, the algorithm has no indication of the purchase/entry prices and therefore cannot compute the realized profits/losses. We usually export yearly reports for past years and then YTD (year-to-date) for current year.

The exported CSVs are not valid: they are concatenated from several tables, each of which is a valid CSV. The name of every table is written as the first column on every row including header. We are interested in the **"Trades"** section - all other table rows need to be manually deleted (may be automatized in future versions).

The suggested file naming convention is `[ENTITY]-[ACCOUNT]-[YEAR or DATE-RANGE]-['full'|'pruned'].['csv'|'pdf']` with 3 files each (2 for bookkeeping, 1 for the analysis). For example, this might be the structure for one year files:

```plaintext
./data/IBIE-U********-2022-full.pdf
./data/IBIE-U********-2022-full.csv
./data/IBIE-U********-2022-pruned.csv
```

#### 2. Configuration

The basic setup is given by `./src/config/personal-data.json`, where you can specify your source files, multipliers for your derivatives, and current (mark-to-market, MTM) prices for your symbols. The file is not commited based on its personal nature, but an example can be viewed at `./example/config/personal-data.json` and also easily copyable to the correct source folder by `npm run copy_example:[windows/linux]`.

#### 3. Running the analysis

The application has an interactive wizard for all commands and can be accessed after build with `npm start`. All views display basic information about what is displayed upon launching.

1. **Historical Analysis (verbose) view**: displays full trading history ticker by ticker, sorted by date.
2. **Loss Harvest view**: displays all orders that have not been fully filled (i.e. active balances) ticker by ticker, including expected tax and time elapsed since order origination.
3. **Open Positions view**: displays all outstanding balances together, summarized either by ticker (totals) or by open (not fully filled) orders (detailed).
4. **Realized Tax view**: displays realized P&L and tax obligations year by year to cross-check your tax accountant and estimate current year tax liability.
5. **Upcoming Timetests view**: displays all open orders similarly to the detailed part of Open Positions view, but sorted by elapsed time since order origination.

### Limitations

-   The functionality may break with a change to Interactive Brokers' export format. However, the main required columns are not expected to change semantically, and it is straightforward to update the parsing algorithm per CSV.
-   It might be a good idea to implement automatical fetching of current (MTM) prices for symbols from a 3rd party API. Currently, it is required to save and update prices manually in `./src/config/personal-data.json`.
-   PDF export pagebreak issues: see [Github issue](https://github.com/fs-public/ib-analyzer/issues/21).

### Changelog

-   **v0.1.0** (mid-2020): initial version
-   **v0.2.0** (26th May 2023): update dependencies, add linter and formatter, Github Actions, first Readme version
-   **v0.2.1** (27th May 2023): minor refactor - fixed all remaining lint warnings and `any` types, add automatic swap of config files by npm script
-   **v0.3.0** (28th May 2023): major refactor - extend Readme, full `jsdoc`, improved project directory structure, refactor full load process (functional statements, separation of concerns, shifting filters upstream), add `dotenv` and load config by a JSON, separated common behavior of Views in `./src/views/director.ts` with generator functions
-   **v0.3.1** (18th June 2023): feature - export results as CSV files. Added eslint plugin for imports.
-   **v0.3.2** (): feature - export results as PDF file.
