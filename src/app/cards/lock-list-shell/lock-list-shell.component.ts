import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LiquidityLockerService } from 'src/app/services/liquidity-locker.service';

@Component({
  selector: 'app-lock-list-shell',
  templateUrl: './lock-list-shell.component.html',
  styleUrls: ['./lock-list-shell.component.scss']
})
export class LockListShellComponent implements OnInit {

  loadingLocks$: BehaviorSubject<boolean>;

  constructor(
    private liquidityLockerService: LiquidityLockerService
  ) {
    this.loadingLocks$ = this.liquidityLockerService.loadingLocks$;
  }

  ngOnInit(): void {
  }

}
