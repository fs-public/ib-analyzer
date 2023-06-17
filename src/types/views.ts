export type ViewGenerator<T extends { [key: string]: string | number | boolean }> = Generator<
    { title?: string; table: T[]; printMoreStats?: () => void; isLast: boolean }, // yield values
    void, // final return value
    never // next() arguments
>

export interface ViewDefinition<T extends { [key: string]: string | number | boolean }> {
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
