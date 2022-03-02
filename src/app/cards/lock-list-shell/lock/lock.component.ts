import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LiquidityLockerService, Lock } from 'src/app/services/liquidity-locker.service';
import { ConnectService, Token } from '../../connect/connect.service';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss']
})
export class LockComponent implements OnInit {

  lockIndex: number;
  lock: Lock;
  ownedBySelectedAccount: boolean;

  constructor(
    private route: ActivatedRoute,
    private liquidityLockerService: LiquidityLockerService,
    private connectService: ConnectService
  ) {

    // Get the index from the URL, load the resource statelessly in ngOnInit
    const lockIndexParam = this.route.snapshot.paramMap.get("index");
    if (!lockIndexParam) throw new Error("Could not get lock index.");
    this.lockIndex = parseInt(lockIndexParam);
  }

  ngOnInit() {
    this.setState();
  }

  async setState() {

    // Load lock
    this.lock = await this.liquidityLockerService.getLock(this.lockIndex);

    // Check ownership
    const owner = this.lock.getOwner();
    const selectedAccount = this.connectService.selectedAccount$.getValue();
    this.ownedBySelectedAccount = owner === selectedAccount;
  }

}
