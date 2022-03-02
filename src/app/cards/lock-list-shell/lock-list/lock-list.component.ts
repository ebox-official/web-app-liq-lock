import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  loadingLocks$: BehaviorSubject<boolean>;
  locks$: Observable<Lock[]>;

  constructor(
    private connectService: ConnectService,
    private liquidityLockerService: LiquidityLockerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loadingLocks$ = this.liquidityLockerService.loadingLocks$;

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

  lockViewInitialized(lock: Lock) {
    const lockIntoViewParam = this.route.snapshot.queryParamMap.get("lockIntoView");
    if (!lockIntoViewParam) return;
    const lockIndex = parseInt(lockIntoViewParam);
    const lockContainerEl = document.querySelector("#lock-" + lockIndex);
    const lockEndEl = document.querySelector("#lock-" + lockIndex + "-end");
    if (lock.index === lockIndex && lockContainerEl && lockEndEl) {
      lockContainerEl.classList.add("lock-into-view");
      lockEndEl.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }

  navigateToDetails(lock: Lock) {
    this.router.navigate([lock.index], { relativeTo: this.route });
  }

}
