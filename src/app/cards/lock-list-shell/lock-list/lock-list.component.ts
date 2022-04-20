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

  locks$: Observable<Lock[]>;
  locksLoading$: BehaviorSubject<boolean>;
  locksInitialized$: BehaviorSubject<boolean>;

  constructor(
    private liquidityLockerService: LiquidityLockerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    
    // This componenet is rendered in two flavors: general and personal
    // General shows all the locks
    // Personal shows only the locks owned by the user
    const viewMode = this.route.snapshot.data["viewMode"];
    if (viewMode === "personal") {
      this.locks$ = this.liquidityLockerService.personalLocks$;
      this.locksLoading$ = this.liquidityLockerService.personalLocksLoading$;
      this.locksInitialized$ = this.liquidityLockerService.personalLocksInitialized$;
    }
    else {
      this.locks$ = this.liquidityLockerService.locks$;
      this.locksLoading$ = this.liquidityLockerService.locksLoading$;
      this.locksInitialized$ = this.liquidityLockerService.locksInitialized$;
    }
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
