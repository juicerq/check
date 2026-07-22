import type { RuleTester } from "oxlint/plugins-dev"

export type Rule = Parameters<RuleTester["run"]>[1]

type Visitors = ReturnType<NonNullable<Rule["create"]>>

export type Node<Type extends keyof Visitors> = Parameters<NonNullable<Visitors[Type]>>[0]

export type AnyNode = { [Type in keyof Visitors]: Node<Type> }[keyof Visitors]
