import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { Modal, ModalsService } from './modals.service';

export interface ModalComponent {
  resolve: any;
  reject: any;
  data: any;
}

@Component({
  selector: 'app-modals',
  template: '<ng-template #dynamicComponent></ng-template>'
})
export class ModalsComponent implements AfterViewInit {

  @ViewChild("dynamicComponent", { read: ViewContainerRef }) dynamicComponentRef: ViewContainerRef;

  constructor(
    private modalsService: ModalsService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private changeDetectionRef : ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.modalsService.modalHasChanged$.subscribe((arg) => this.loadComponent(arg));
  }

  loadComponent(modal: Modal) {

    // Clear the container
    this.dynamicComponentRef.clear();

    // If modal is undefined, then stop here
    if (!modal) return;

    // Get the component factory
    const componentFactory = this.componentFactoryResolver
      .resolveComponentFactory<ModalComponent>(modal.component);

    // Instantiate the component and give it the data, then reflect changes
    const componentRef = this.dynamicComponentRef
      .createComponent<ModalComponent>(componentFactory);
    componentRef.instance.resolve = modal.resolve;
    componentRef.instance.reject = modal.reject;
    componentRef.instance.data = modal.data;
    this.changeDetectionRef.detectChanges();
  }

}
