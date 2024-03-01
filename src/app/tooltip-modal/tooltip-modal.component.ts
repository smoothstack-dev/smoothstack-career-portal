import { Component, Input } from '@angular/core';
import { NovoModalRef, NovoModalService } from 'novo-elements';

/**
 * @title Custom Modal Example
 */
@Component({
  selector: 'tooltip-modal',
  templateUrl: './tooltip-modal.component.html',
  styleUrls: ['./tooltip-modal.component.scss'],
})
export class TooltipModal {
  @Input() icon: string;
  @Input() modal: any;
  constructor(private modalService: NovoModalService) {}
  public ngOnInit(): void {}
  public showModal(): void {
    this.modalService.open(this.modal);
  }
}
