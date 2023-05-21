///////////////////////// Global

export type CsvSource = {
    filename: string;
    reschemeRequired: boolean;
    transformation: (string | boolean)[];
    schema: string[];
}

export type DataObject = {
    orders:Order[],
    fills:Fill[],
    sets: {
        categories: Set<string>,
        currencies: Set<string>,
        symbols: Set<string>,
        activeSymbols: Set<string>,
        years: Set<number>,
    }
}

export type Env = {
    data: DataObject,
    logging: boolean,
    errors: string[],
    log: (...args:any) => void,
    table: (...args:any) => void,
    error: (description:string, critical?: boolean) => void,
    flushErrors: () => void,
}

///////////////////////// Records

export type UnschemedRecord = any[]

//   0      1            2                3           4       5        6        7         8      9         10      11      12       13         14     15
/// Trades,Header,DataDiscriminator,Asset Category,Currency,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code
export type SchemedRecord = any[16]



///////////////////////// Orders

export type Order = {
    // Now data are prepared in 'orders' in SORTED format, as an array of 13-key trade objects:
    // Description of fields: https://ibkrguides.com/reportingreference/reportguide/trades_modelstatements.htm

    id: number,

    // IB reported fields
    assetcategory: string,              // 'Stocks'
    currency: string,                   // 'EUR'
    symbol: string,                     // 'IMAE' - GETS CURRENCY APENDED DURING LOAD!
    datetime: Date,                     // Date(2022-08-19T05:44:14.000Z)
    quantity: number,                   // 90 - stocks moved
    tprice: number,                     // 63.8 - trade price
                                        //     - IS MULTIPLIED BY MULTIPLIER DURING LOAD!
    proceeds: number,                   // -5742 - my account balance change without fee as reported by IB
                                        //       - validated to ≈ tprice * quantity
    commfee: number,                    // -2.871 - my account balance change fee, is always negative
    basis: number,                      // 5744.871 - basis for position as reported by IB
                                        //          - validated for 'O'pening orders to ≈ proceeds + commfee
    realizedpl: number,                 // 0 - realized profit or loss including commfee as reported by IB
                                        //   - validated to 0 for 'O'pening orders
    code: string,                       // 'O' - codes, can be several with ';' delimiter
                                        //     - 'O'pening order, 'C'losing order
    
    // Self-computed fields
    action: string,
    filled: number,                     // 0 - filled trace when analyzing sells
    tax: number,
}

///////////////////////// Fills

// Every fill matches an open and a close
export type Fill = {
    // Links to the orders
    closeId: number,                    // primary, order that spawned this
    openId: number,                     // the order that this fill filled (open)
    symbol: string,

    // Self-computed fields - fill values
    quantity: number,
    basis: number,
    proceeds: number,
    commfee: number,
    realizedpl: number,
    
    timetest: number,
    tax: number,
    timetestApplied: boolean,

    // Self-computed fields - descriptors
    thisId: number,
}