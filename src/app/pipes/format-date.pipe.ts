import { Pipe, PipeTransform } from '@angular/core';
import { MONTH_NAMES } from '../data/constants';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {

  transform(value: any): unknown {
    if (value === null || value === undefined)
      return "Invalid input. (DateFormatterPipe)";
    
    let stringified = value.toString();

    let isJavascriptDate = value instanceof Date;
    let isInvalidDate = isJavascriptDate && (stringified === "Invalid Date");

    let isNumber = !isNaN(stringified);
    let isInvalidNumber = isNumber && (stringified.length < 10 || stringified.length > 13);
    
    if (isInvalidDate || isInvalidNumber) {
      return "Invalid input. (DateFormatterPipe)"
    }

    if (isJavascriptDate) {
      stringified = value.getTime().toString();
    }

    if (stringified.length === 10) {
      stringified = stringified + "000";
    }

    let d = new Date(parseInt(stringified));
    let hh = d.getHours().toString().padStart(2, "0");
    let mm = d.getMinutes().toString().padStart(2 , "0");
    let dd = d.getDate();
    let monthName = MONTH_NAMES[d.getMonth()];
    let yyyy = d.getFullYear();

    return `${hh}:${mm} / ${monthName} ${dd} / ${yyyy}`;
  }

}
