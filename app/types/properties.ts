interface BaseProperty {
  name: string;
  type: string;
}

export interface TextProperty extends BaseProperty {
  type: "text";
  value: string;
}

export interface NumberProperty extends BaseProperty {
  type: "number";
  value: number;
}

export interface CheckboxProperty extends BaseProperty {
  type: "checkbox";
  value: boolean;
}

export interface DateProperty extends BaseProperty {
  type: "date";
  value: string;
}

export interface SelectProperty extends BaseProperty {
  type: "select";
  value: string;
  options: string[];
}

export interface MultiSelectProperty extends BaseProperty {
  type: "multi-select";
  value: string[];
  options: string[];
}

export type Property =
  | TextProperty
  | NumberProperty
  | CheckboxProperty
  | DateProperty
  | SelectProperty
  | MultiSelectProperty;