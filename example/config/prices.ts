import { ConfigMultiplier } from "../types/global"

export const DERIVATIVES_MULTIPLIERS: ConfigMultiplier[] = [
    // parsed as 'symbol contains this'
    { matcher: "DAX", multiplier: 5 },
    { matcher: "XSP", multiplier: 100 },
]

export const MTM_PRICES = {
    "AAPL-USD": 137.59,
    "AMZN-USD": 107.61,
    "MSFT-USD": 252.56,
    "DAX 15MAR24 12800 C-EUR": 3192.8 * 5,
    "DAX 15MAR24 12800 P-EUR": 435.8 * 5,
    "XSP 15DEC23 380 P-USD": 19.72 * 100,
}

//const MTM_CURRENCIES = {}
