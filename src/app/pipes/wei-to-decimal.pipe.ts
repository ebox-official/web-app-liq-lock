import { Pipe, PipeTransform } from '@angular/core';
import { ConnectService } from '../cards/connect/connect.service';

@Pipe({
  name: 'weiToDecimal'
})
export class WeiToDecimalPipe implements PipeTransform {

  constructor(
    private connectService: ConnectService
  ) {}

  transform(value: any, decimals: number | string): unknown {
    return this.connectService.weiToDecimal(value, decimals);
  }

}
