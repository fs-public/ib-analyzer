# TODO

### old

Set `if(row[6] === "IEP" && row[7] === "2021-09-30, 09:30:02")` in config
validate symbols
throw new Error("Bad numerical key " + numericalKey)
implement Issues instead of throwing errors
refactor fills as primary and secondary order, instead of close and open

# Interactive Brokers Analyzer

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

### Installation

The project is not published on _npm_. Please pull the source to a local directory, then run the following command.

```bash
npm install
```

After dependencies are installed, simply run `npm run build` for a one-time build or `npm run watch` for real-time compilation.

Analysis launches with npm script `npm start`. For configuration, see the [Usage section](#Usage).

### Technology

The project runs with `npm` and `node` and is written in Typescript. Community library `csv-parse` is used for parsing the CSV exports from Interactive Brokers. Code quality assured by `prettier` and `eslint` and enforced by `Github Actions`.

The application sequentially executes the following steps:

1. (`./src/process/1-loader.ts`) Data CSVs are loaded into memory and reschemed based on the configuration file. CSV validity under the scheme is checked.
2. (`./src/process/2-parseOrders.ts`) Relevant rows are parsed into orders, matched with multipliers, and saved in typed objects. Multipliers are validated.
3. (`./src/process/3-matchFills`) Orders are matched against themselves to find full and partial fills, as well as unfilled orders (_by fills we understand decreasing outstanding holdings, i.e. fills against oneself; not partial fulfillment of the orders on the market_). IB reports profits/losses (P&L) for closing orders, which is validated against self-computed P&L.
4. (`./src/process/4-validator.ts`) Throughout 1-3, more validations are executed by the separated validator functions, including unrecognized or unsupported values, incorrect/unexpected computations on IB side, sorting, and unmatched orders.
5. Application loop is ran, allowing to reload data, display issues, and show various views (see [Running the Analysis](#3-running-the-analysis) section) through an interactive wizard.

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
3. **Open Positions view**: displays all outstanding balances together, summarized by ticker and then by open (unfilled) orders.
4. **Realized Tax view**: displays realized P&L and tax obligations year by year to cross-check your tax accountant and estimate current year tax liability.
5. **Upcoming Timetests view**: displays all open orders similarly to the detailed part of Open Positions view, but sorted by elapsed time since order origination.

### Limitations

-   The functionality may break with a change to Interactive Brokers' export format. However, the main required columns are not expected to change semantically, and it is straightforward to update the parsing algorithm per CSV.

### Changelog

-   **v0.1.0** (mid-2020): initial version
-   **v0.2.0** (26th May 2023): update dependencies, add linter and formatter, Github Actions, first Readme version
