import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-find-lock',
  templateUrl: './find-lock.component.html',
  styleUrls: ['./find-lock.component.scss']
})
export class FindLockComponent implements OnInit {

  lockIndex: FormControl;
  findLockForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.lockIndex = new FormControl("", [Validators.required, Validators.pattern(/^\d+$/)]);
    this.findLockForm = new FormGroup({
      lockIndex: this.lockIndex
    });
  }

  onSubmit() {
    this.router.navigate([this.lockIndex.value], { relativeTo: this.route });
  }

}
