import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LiquidityLockerService, Lock } from 'src/app/services/liquidity-locker.service';

@Component({
  selector: 'app-lock-list-item',
  templateUrl: './lock-list-item.component.html',
  styleUrls: ['./lock-list-item.component.scss']
})
export class LockListItemComponent implements OnInit {

  @Input("lock") lock: Lock;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {
  }

  navigateToDetails() {
    this.router.navigate([this.lock.index], { relativeTo: this.route });
  }

}
