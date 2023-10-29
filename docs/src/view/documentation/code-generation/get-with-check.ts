import * as functionality from "../functionality";

export const getGroupOrderNumber = (title: string, orders: OrderSpecifier) =>
  orders[title] ??
  functionality.doThrow(`Could not find order number for group "${title}"`);

export const getIndexedModel = (id: number, index: functionality.ModelIndex) =>
  index[id] ??
  functionality.doThrow(`Could not to find declaration with ID ${id}`);

export type OrderSpecifier = Record<string, number>;
