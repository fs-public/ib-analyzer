import { ValueObject } from "./global"

export type ViewGenerator<T extends ValueObject> = Generator<
    { title?: string; table: T[]; printMoreStats?: () => void; isLast: boolean }, // yield values
    void, // final return value
    never // next() arguments
>

export interface ViewDefinition<T extends ValueObject = ValueObject> {
    name: string
    command: string
    generator: () => ViewGenerator<T>
    description: {
        table?: string
        row?: string
        notes?: string[]
    }
    screenplay: {
        nextTableMessage?: string
    }
}
