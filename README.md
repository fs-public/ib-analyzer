# TODO

### old

Set `if(row[6] === "IEP" && row[7] === "2021-09-30, 09:30:02")` in config
validate symbols
throw new Error("Bad numerical key " + numericalKey)
implement Issues instead of throwing errors
refactor fills as primary and secondary order, instead of close and open

# Interactive Brokers Analyzer

NodeJS utility to parse and analyze Interactive Brokers trade reports from the POV of the local (Czech Republic) tax authority.

In Czech Republic, capital gains are:

-   Taxed 15 %,
-   Matched in a first-in-first-out (FIFO) fashion,
-   Losses offset gains in full within one tax year (and cannot be carried over), and
-   Capital gains or losses realized after 3 years or more are fully exempt (neither tax obligation required nor offset possible).

The application matches your trades based on these rules, computes tax obligation to cross-check your tax accountant, and suggests possible tax loss harvests and coming-up 3-year exemptions. Short sells and derivatives are supported as well.

The application has been used on Central Europe (IBCE) and Ireland (IBIE) offices and is being maintained at least on a yearly basis for IBIE.

### Installation

The project is not published on _npm_. Please pull the source to a local directory, then run the following command.

```bash
npm install
```

After dependencies are installed, simply run `npm run build` for a one-time build or `npm run watch` for real-time compilation.

Analysis launches with npm script `npm start`. The configuration TODO

### Technology

The project runs with `npm` and `node` and is written in Typescript. Community library `csv-parse` is used for parsing the CSV exports from Interactive Brokers. Code quality assured by `prettier` and `eslint`.

### Usage

Within Interactive Brokers, navigate to reports and export arbitrary time-ranges with the _Activity_ preset to CSV and PDF (_the PDF variants are suggested for manual cross-checking of the data sources, as the size grows fast with many trades and years of trading history_).

For correct functionality, it is crucial to export from the beginning of trading history. Otherwise, the algorithm has no indication of the purchase/entry prices and therefore cannot compute the realized profits/losses. We usually export yearly reports for past years and then YTD (year-to-date) for current year.

The exported CSVs are not valid: they are concatenated from several tables, each of which is a valid CSV. The name of every table is written as the first column on every row including header. We are interested in the **"Trades"** section - all other table rows need to be manually deleted (may be automatized in future versions).

The suggested file naming convention is `[ENTITY]-[ACCOUNT]-[YEAR or DATE-RANGE]-['full'|'pruned'].['csv'|'pdf']` with 3 files each (2 for bookkeeping, 1 for the analysis). For example, this might be the structure for one year files:

```plaintext
./data/IBIE-U********-2022-full.pdf
./data/IBIE-U********-2022-full.csv
./data/IBIE-U********-2022-pruned.csv
```

Data preparation is the only required step. The application has an interactive wizard for all commands and can be accessed after build with `npm start`.

### Limitations

-   The functionality may break with a change to Interactive Brokers' export format. However, the main required columns are not expected to change semantically, and it is straightforward to update the parsing algorithm per CSV.

### Changelog

-   **v0.1.0** (mid-2020): initial version
-   **v0.2.0** (): TODO
