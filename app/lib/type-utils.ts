/**
 * Common utility types for better type safety across the application
 */

/**
 * Make specific properties required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Make specific properties optional
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make all properties required and non-nullable
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * Async function type
 */
export type AsyncFunction<T = void> = () => Promise<T>;

/**
 * Callback function type with parameter
 */
export type Callback<T = void, P = void> = (param: P) => T;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * Maybe type (nullable or undefined)
 */
export type Maybe<T> = T | null | undefined;

/**
 * NonEmpty array type
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Extract non-nullable properties from type
 */
export type NonNullableProperties<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Extract keys of type T that have value type V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Extract string literal type from union
 */
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;

/**
 * Primitive types
 */
export type Primitive = string | number | boolean | null | undefined | symbol | bigint;

/**
 * Function with no parameters
 */
export type VoidFunction = () => void;

/**
 * Async function with no parameters
 */
export type AsyncVoidFunction = () => Promise<void>;

/**
 * Error handler function type
 */
export type ErrorHandler = (error: Error) => void;

/**
 * Success handler function type
 */
export type SuccessHandler<T = unknown> = (data: T) => void;

/**
 * Generic result type (success or error)
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Await type helper - extracts the resolved type from a Promise
 */
export type Await<T> = T extends Promise<infer U> ? U : T;

/**
 * Extract function parameters type
 */
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any
  ? P
  : never;

/**
 * Extract function return type
 */
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R
  ? R
  : any;
