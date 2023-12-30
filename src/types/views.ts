import { ValueObject } from "./global"

export type GeneratedView<T extends ValueObject> = {
  title: string
  table: T[]
  additionalContentBefore?: string
  additionalContentAfter?: string
}

export interface ViewDefinition<T extends ValueObject = ValueObject> {
  name: string
  command: string
  generateView: () => GeneratedView<T>[]
  description: {
    table?: string
    row?: string
    notes?: string[]
  }
  screenplay: {
    nextTableMessage?: string
  }
}
