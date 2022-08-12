import { Component } from '@angular/core';
import * as LINKS from '../utils/links';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public companyName: string;
  public logoLink: string;
  public isLogoContainsLink: boolean = true;

  constructor() {
    this.companyName = 'Smoothstack';
    this.logoLink = LINKS.logoLink;
    if (window.location.href.toUpperCase().includes('SUCCESS')) this.isLogoContainsLink = false;
  }
  public goToSSWebsite(): void {
    window.location.href = 'https://smoothstack.com/';
  }
}
