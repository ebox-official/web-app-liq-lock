import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LiquidityLockerService, Lock } from 'src/app/services/liquidity-locker.service';
import { ConnectService } from '../../connect/connect.service';

@Component({
  selector: 'app-lock-list',
  templateUrl: './lock-list.component.html',
  styleUrls: ['./lock-list.component.scss']
})
export class LockListComponent implements OnInit {

  locksInitialized$: BehaviorSubject<boolean>;
  locks$: Observable<Lock[]>;

  constructor(
    private connectService: ConnectService,
    private liquidityLockerService: LiquidityLockerService,
    private route: ActivatedRoute
  ) {
    this.locksInitialized$ = this.liquidityLockerService.locksInitialized$;

    // This componenet is rendered in two flavors: general and personal
    // General shows all the locks
    // Personal shows only the locks owned by the user
    const viewMode = this.route.snapshot.data["viewMode"];
    this.locks$ = this.liquidityLockerService.locks$
      .pipe(
        map((locks: Lock[]) => {

          if (viewMode === "general")
            return locks;
          return locks.filter((lock: Lock) => {
            const selectedAccount = this.connectService.selectedAccount$.getValue();
            if (lock.transfers) {
              const latestTransfer = lock.transfers[lock.transfers.length - 1];
              return latestTransfer.newOwner === selectedAccount;
            }
            return lock.originalOwner === selectedAccount;
          });

        })
      );
  }

  trackLockByIndex(index: number, lock: Lock) {
    return lock.index;
  }

  ngOnInit(): void {
  }

}
