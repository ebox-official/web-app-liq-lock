import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LiquidityLockerService, LockInitialData, Lock } from 'src/app/services/liquidity-locker.service';

@Component({
  selector: 'app-lock-list-shell',
  templateUrl: './lock-list-shell.component.html',
  styleUrls: ['./lock-list-shell.component.scss']
})
export class LockListShellComponent implements OnInit {

  routerEventsSubscription: Subscription;

  progressBarShown: boolean;

  locksInitialData: LockInitialData[];
  locks: Lock[];
  locksLoading$: BehaviorSubject<boolean>;
  locksInitialized$: BehaviorSubject<boolean>;

  constructor(
    private liquidityLockerService: LiquidityLockerService,
    private router: Router
  ) {

  }

  ngOnInit(): void {

    this.detectRouteAndManageProgressBarData(this.router.url);

    // Attach an handler on NavigationEnd
    this.routerEventsSubscription = this.router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd)
          this.detectRouteAndManageProgressBarData(event.url)
      });
  }

  ngOnDestroy() {

    // Dettach the handler to avoid memory leaks
    this.routerEventsSubscription.unsubscribe();
  }

  detectRouteAndManageProgressBarData(routerUrl: string) {
    this.progressBarShown = false;
    if (routerUrl.match(/\/lock-list\/personal/)) {
      this.progressBarShown = true;
      this.locksInitialData = this.liquidityLockerService.personalLocksInitialData;
      this.locks = this.liquidityLockerService.personalLocks;
      this.locksLoading$ = this.liquidityLockerService.personalLocksLoading$;
      this.locksInitialized$ = this.liquidityLockerService.personalLocksInitialized$;
    }
    else if (routerUrl.match(/\/lock-list\/general/)) {
      this.progressBarShown = true;
      this.locksInitialData = this.liquidityLockerService.locksInitialData;
      this.locks = this.liquidityLockerService.locks;
      this.locksLoading$ = this.liquidityLockerService.locksLoading$;
      this.locksInitialized$ = this.liquidityLockerService.locksInitialized$;
    }
  }

}
