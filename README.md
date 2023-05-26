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

The application matches your trades based on these rules, computes tax obligation to cross-check your tax accountant, and suggests possible tax loss harvests and coming-up 3-year exemptions.

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

TODO

### Limitations

TODO

### Changelog

-   **v0.1.0** (mid-2020): initial version
-   **v0.2.0** (): TODO
