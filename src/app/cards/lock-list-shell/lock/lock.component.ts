import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LiquidityLockerService, Lock } from 'src/app/services/liquidity-locker.service';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss']
})
export class LockComponent implements OnInit {

  loadingLocks$: BehaviorSubject<boolean>;
  lock$: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private liquidityLockerService: LiquidityLockerService
  ) {
    const lockIndex = this.route.snapshot.paramMap.get("index");
    this.loadingLocks$ = this.liquidityLockerService.loadingLocks$;
    this.lock$ = this.liquidityLockerService.locks$
      .pipe(
        map((locks: Lock[]) =>
          locks.find((lock: Lock) => lock.index === Number(lockIndex))
        )
      );
  }

  ngOnInit(): void {
  }

}
