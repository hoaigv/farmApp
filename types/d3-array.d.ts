// src/types/d3-array.d.ts

/**
 * Nếu bạn chỉ cần extent, khai basic như dưới.
 * Bổ sung thêm các hàm khác nếu dùng:
 *  - histogram, bisect, group, ...
 */
declare module "d3-array" {
  export function extent<T>(
    array: readonly T[]
  ): [T, T] | [undefined, undefined];
  // Ví dụ thêm khai báo histogram nếu cần:
  // export function histogram<Datum, Value>(
  //   data: Datum[],
  //   options?: {
  //     value?: (d: Datum) => Value;
  //     domain?: [Value, Value];
  //     thresholds?: number | Value[];
  //   }
  // ): Array<Array<Datum> & { x0: Value; x1: Value }>;
}
