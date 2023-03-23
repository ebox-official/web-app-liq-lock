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
  lockRetrievalError: number;

  shareLink: string;

  constructor(
    private route: ActivatedRoute,
    private liquidityLockerService: LiquidityLockerService,
    private connectService: ConnectService
  ) {
    
    // Set initial state of lockRetrievalError to -1 (which means not in error)
    this.lockRetrievalError = -1;
    
    // Get the index from the URL, load the resource statelessly in ngOnInit
    const lockIndexParam = this.route.snapshot.paramMap.get("index");
    if (!lockIndexParam) throw new Error("Could not get lock ID.");
    this.lockIndex = parseInt(lockIndexParam);

//	this.shareLink = `${document.location.origin}/${(document.location.hostname == "localhost" || document.location.hostname == "127.0.0.1") ? "" : "liq-lock/"}lock-list/find/${this.lockIndex}`;
	this.shareLink = `${document.location.origin}/lock-list/find/${this.lockIndex}`;
  }

  ngOnInit() {
    this.setState();
  }

  async setState() {

    // Load lock
    try {
      this.lock = await this.liquidityLockerService.getLock(this.lockIndex);
    }
    catch (err) {
      this.lockRetrievalError = this.lockIndex;
      return;
    }

    // Check ownership
    const owner = this.lock.getOwner();
    const selectedAccount = this.connectService.selectedAccount$.getValue();
    this.ownedBySelectedAccount = owner === selectedAccount;
  }

}
