import { Component, NgModule } from '@angular/core';
import { CONTACT_FORM_TYPE } from '../typings/contactPage';
import { CORPORATION } from '../typings/corporation';
import { NovoDropdownModule } from 'novo-elements';
import * as LINKS from '../utils/links';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.scss'],
})
@NgModule({
  imports: [NovoDropdownModule],
  declarations: [NovoDropdownModule],
})
export class ContactPageComponent {
  public selectedForm: CONTACT_FORM_TYPE;
  public job: any = {} as any;
  public logoLink: string;
  public;

  constructor() {
    this.logoLink = LINKS.logoLink;
    this.job = {
      corpId: CORPORATION['APPRENTICESHIP'].corpId,
      id: 1,
    };
    const queryParams = new URLSearchParams(window.location.search);
    // TODO: this is not done yet
    const form = queryParams.get('form');
    switch (form) {
      case 'build-your-team':
        this.selectedForm = CONTACT_FORM_TYPE.BUILD;
        break;
      case 'become-a-partner':
        this.selectedForm = CONTACT_FORM_TYPE.RECRUIT;
        break;
      default:
        this.selectedForm = CONTACT_FORM_TYPE.JOIN;
        break;
    }
  }

  public switchForm(selectedForm: CONTACT_FORM_TYPE): void {
    this.selectedForm = selectedForm;
  }

  public goTo(url: string) {
    window.location.href = url;
  }
}
