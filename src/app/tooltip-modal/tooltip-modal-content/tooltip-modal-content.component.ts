import { Component } from '@angular/core';
import { NovoModalRef } from 'novo-elements';

@Component({
  selector: 'tooltip-modal-content-race',
  templateUrl: './race.html',
  styleUrls: ['./tooltip-modal-content.component.scss'],
})
export class TooltipModalContentRace {
  constructor(private modalRef: NovoModalRef) {}
  close() {
    this.modalRef.close();
  }
}

@Component({
  selector: 'tooltip-modal-content-disability',
  templateUrl: `./disability.html`,
  styleUrls: ['./tooltip-modal-content.component.scss'],
})
export class TooltipModalContentDisability {
  constructor(private modalRef: NovoModalRef) {}
  close() {
    this.modalRef.close();
  }
}

@Component({
  selector: 'tooltip-modal-content-veteran',
  templateUrl: `./veteran.html`,
  styleUrls: ['./tooltip-modal-content.component.scss'],
})
export class TooltipModalContentVeteran {
  constructor(private modalRef: NovoModalRef) {}
  close() {
    this.modalRef.close();
  }
}

@Component({
  selector: 'tooltip-modal-content-voluntary-disclosure',
  templateUrl: './voluntary.html',
  styleUrls: ['./tooltip-modal-content.component.scss'],
})
export class TooltipModalContentVoluntary {
  constructor(private modalRef: NovoModalRef) {}
  close() {
    this.modalRef.close();
  }
}
