import readline from 'readline'
import { MTM_PRICES } from './config/prices'
import { env } from './env'

// Env

export const assert = (condition:boolean, message="Assertion Failed!", critical = false) => {
    if(!condition) {
        env.error(message, critical)
    }
}

// Date manipulation

export const getDatePlus3y = (date: Date): Date => {
    const newDate = new Date(date)
    newDate.setFullYear(newDate.getFullYear() + 3)
    return newDate
}

export const did3yPass = (from: Date, to: Date | null = null): boolean => {
    const threshold = getDatePlus3y(from)
    if(to === null)
        return Date.now() > threshold.getTime()
    else
        return to > threshold
}

export const getDateDiff = (from: Date, to: Date): number => {
    return to.getTime() - from.getTime()
}

export const millisecondsToString = (milliseconds:number): string => {
    if(milliseconds <= 0)
        return "0"

    const days = Math.floor(milliseconds / 1000 / 60 / 60 / 24)
    const years = Math.floor(days / 365)

    if(years >= 3)
        return "3y+ !!!!!!!"
    
    if(years >= 1)
        return `${years}y ${days-365*years}d`
    
    return `${days}d`
}

export const getDateDiffDisplay = (from: Date, to: Date): string => {
    return millisecondsToString(getDateDiff(from, to))
}


// Display utils

export const fixed = (number:number, decimals:number = 2) => {
    return Math.round(number*10**decimals)/(10**decimals)
}

export const makeObjectFixedDashed = <T extends {[key: string]: any}>(obj: T, skipKeys: (keyof T)[] = []): T => {
    for(const key in obj) {
        if(typeof obj[key] === 'number' && !skipKeys.includes(key)) { // @ts-ignore
            obj[key] = obj[key] === 0 ? "-" : fixed(obj[key])
        }
    }
    return obj
}

// User input

export const getUserInput = async (prompt:string = 'Press ENTER to continue... '): Promise<string> => {
    const interf = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise(resolve => {
        interf.question("\n" + prompt, input => {
            interf.close()
            resolve(input)
        })
    })
}

export const getUserENTERInput = async (prompt:string = 'for next page'): Promise<boolean> => {
    const command = await getUserInput(`Press ENTER ${prompt} or 's' to stop... `)
    return command !== 's'    
}

// Config access
export const getPriceBySymbol = (symbol: string): number => {
    return symbol in MTM_PRICES ? MTM_PRICES[symbol as keyof typeof MTM_PRICES] : 0
}