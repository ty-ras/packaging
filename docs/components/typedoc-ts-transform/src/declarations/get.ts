import { Throw } from "throw-expression";

export const getGroupOrderNumber = (title: string, orders: OrderSpecifier) =>
  orders[title] ?? Throw(`Could not find order number for group "${title}"`);

export type OrderSpecifier = Record<string, number>;
