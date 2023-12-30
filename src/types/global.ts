import { Order, Fill } from "./trades"

/** "ok" (no transformation needed), "drop" (pop one value), "insert-zero" (push one '0' value) */
export type Transformation = "ok" | "drop" | "insert-zero"

export interface CSVSource {
  filename: string
  transformation: readonly Transformation[]
  schema: readonly string[]
}

export interface DataObject {
  orders: Order[]
  fills: Fill[]
  sets: {
    categories: Set<string>
    currencies: Set<string>
    symbols: Set<string>
    activeSymbols: Set<string>
    years: Set<number>
  }
}

export type ConfigMultiplier = { matcher: string; multiplier: number }

export interface Env {
  data: DataObject
  errors: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: (...args: any) => void
  table: (...args: object[]) => void
  error: (description: string, critical?: boolean) => void
  flushErrors: () => void
}

// Utilities

export type Value = string | number | boolean
export type ValueObject = { [key: string]: string | number | boolean }

export type DisplayRetyped<T> = { [key in keyof T]: string | number }
