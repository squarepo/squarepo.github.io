export type ContextMenuItem = {
  type: "item",
  label: string,
  value: string
} | {
  type: "divider"
};