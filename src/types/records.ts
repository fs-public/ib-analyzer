/**
 * An unknown row of a source CSV file.
 */
export type UnschemedRecord = any[]

/**
 * A row of a source CSV file with expected order of values:
 *  0      1            2                3           4       5        6        7         8      9         10      11      12       13         14     15
 * Trades,Header,DataDiscriminator,Asset Category,Currency,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code
 */
export type SchemedRecord = any[16]
