import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis'
})
export class EllipsisPipe implements PipeTransform {

  transform(value: unknown, maxLength: number): unknown {

    if (typeof value !== "string") return "-";

    if (value.length > maxLength)
      return value.slice(0, Math.floor((maxLength - 1) / 2))
           + "..."
           + value.slice(-Math.floor(maxLength / 2));
    
    return value;
  }

}
