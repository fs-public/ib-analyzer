export type ViewGenerator = Generator<
    { title?: string; table: object; printMoreStats?: () => void; isLast: boolean }, // yield values
    void, // final return value
    never // next() arguments
>

export type ViewDefinition = {
    name: string
    command: string
    generator: () => ViewGenerator
    description: {
        table?: string
        row?: string
        notes?: string[]
    }
    screenplay: {
        nextTableMessage?: string
    }
}
