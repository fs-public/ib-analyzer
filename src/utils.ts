import readline from "readline"
import { DERIVATIVES_MULTIPLIERS, MTM_PRICES } from "./config/personalLoader"
import { env } from "./env"
import { DisplayRetyped } from "./types/utilities"
import { CODES } from "./config/config"

// Env ////////////////////////////////////////////////////////////////////////

export const assert = (condition: boolean, message = "Assertion Failed!", critical = false) => {
    if (!condition) {
        env.error(message, critical)
    }
}

export const delay = () => {
    if (!process.env["SLOW_LOGGING"]) return

    let count = 0
    for (let i = 0; i < 100_000 * Number(process.env["SLOW_LOGGING"]); i++) {
        count += i * i
    }

    return count
}

// Date manipulation ////////////////////////////////////////////////////////////////////////

export const getDatePlus3y = (date: Date): Date => {
    const newDate = new Date(date)
    newDate.setFullYear(newDate.getFullYear() + 3)
    return newDate
}

export const did3yPass = (from: Date, to: Date | null = null): boolean => {
    const threshold = getDatePlus3y(from)
    if (to === null) return Date.now() > threshold.getTime()
    else return to > threshold
}

export const getDateDiff = (from: Date, to: Date): number => {
    return to.getTime() - from.getTime()
}

export const millisecondsToString = (milliseconds: number): string => {
    if (milliseconds <= 0) return "0"

    const days = Math.floor(milliseconds / 1000 / 60 / 60 / 24)
    const years = Math.floor(days / 365)

    if (years >= 3) return "3y+ !!!!!!!"

    if (years >= 1) return `${years}y ${days - 365 * years}d`

    return `${days}d`
}

export const getDateDiffDisplay = (from: Date, to: Date): string => {
    return millisecondsToString(getDateDiff(from, to))
}

// Display utils ////////////////////////////////////////////////////////////////////////

/**
 * Rounds a number to specified number of decimals (keeping it as a number)
 */
export const fixed = (number: number, decimals = 2) => {
    return Math.round(number * 10 ** decimals) / 10 ** decimals
}

/**
 * Transforms numerical entries of an object into pretty strings by replacing zeroes with '-'
 * and rounding to two decimal places.
 * @param obj Object to be transformed
 * @param skipKeys Keys to exempt from transformation
 * @returns Correctly typed pretty-printable object
 */
export const makeObjectFixedDashed = <T extends { [key: string]: string | number | boolean }>(
    obj: T,
    skipKeys: (keyof T)[] = []
): DisplayRetyped<T> => {
    const transformedProperties: Partial<DisplayRetyped<T>> = {}
    for (const key in obj) {
        if (typeof obj[key] === "number" && !skipKeys.includes(key)) {
            transformedProperties[key] = obj[key] === 0 ? "-" : fixed(obj[key] as number)
        }
    }
    return { ...obj, ...transformedProperties }
}

// User input ////////////////////////////////////////////////////////////////////////

/**
 * Promps user for an input and returns it as a string.
 */
export const getUserInput = async (prompt = "Press ENTER to continue... "): Promise<string> => {
    const interf = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    return new Promise((resolve) => {
        interf.question("\n" + prompt, (input) => {
            interf.close()
            resolve(input)
        })
    })
}

/**
 * Prompts user for next page of display including an abort command
 */
export const getUserENTERInput = async (prompt = "for next page"): Promise<boolean> => {
    const command = await getUserInput(`Press ENTER ${prompt} or 's' to stop... `)
    return command !== "s"
}

// Code Manipulation ////////////////////////////////////////////////////////////////////////

/**
 * Returns whether a string code contains a specific flag.
 */
export const codeHasFlag = (code: string, flag: string) => {
    return code.split(";").includes(flag)
}

/**
 * Returns whether a string code contains all specific flags.
 */
export const codeHasAllFlags = (code: string, flags: string[]) => {
    return !flags.map((flag) => codeHasFlag(code, flag)).includes(false)
}

/**
 * Returns whether a string code contains at least one of specific flags.
 */
export const codeHasOneFlag = (code: string, flags: string[]) => {
    return flags.map((flag) => codeHasFlag(code, flag)).includes(true)
}

/**
 * Returns a string code with additional flag
 */
export const codeAddFlag = (code: string, flag: (typeof CODES.CUSTOM)[keyof typeof CODES.CUSTOM]) => {
    return code + ";" + flag
}

// Config access ////////////////////////////////////////////////////////////////////////

/**
 * Type-safe return of symbol price from config or zero if not found.
 */
export const getPriceBySymbol = (symbol: string): number => {
    return symbol in MTM_PRICES ? MTM_PRICES[symbol as keyof typeof MTM_PRICES] : 0
}

/**
 * Helper used in order parsing to find derivative multiplier. All prices are multiplied by it and it is no longer kept afterwards.
 */
export const getMultiplier = (assetcategory: string, symbol: string): number => {
    if (assetcategory === "Stocks") return 1

    for (const pair of DERIVATIVES_MULTIPLIERS) {
        if (symbol.includes(pair.matcher)) {
            return pair.multiplier
        }
    }

    env.error("A derivative without recognized multiplier: " + symbol)
    return 1
}
