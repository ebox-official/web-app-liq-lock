import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LiquidityLockerService, Lock } from 'src/app/services/liquidity-locker.service';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss']
})
export class LockComponent implements OnInit {

  lockIndex: number;
  lock: Lock;

  constructor(
    private route: ActivatedRoute,
    private liquidityLockerService: LiquidityLockerService
  ) {
    const lockIndexParam = this.route.snapshot.paramMap.get("index");
    if (!lockIndexParam) throw new Error("Could not get lock index.");
    this.lockIndex = parseInt(lockIndexParam);
  }

  async ngOnInit() {
    this.lock = await this.liquidityLockerService.getLock(this.lockIndex);
  }

}
