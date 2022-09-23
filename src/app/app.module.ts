import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChomskyModule } from 'chomsky';

import { AppComponent } from './app.component';
import { JobListComponent } from './job-list/job-list.component';
import { SettingsService } from './services/settings/settings.service';
import { AnalyticsService } from './services/analytics/analytics.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SearchService } from './services/search/search.service';
import { PreviousRoute } from './services/previouseRoute/previouseRoute.service';
import { ShareService } from './services/share/share.service';
import { ApplyService } from './services/apply/apply.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SidebarFilterComponent } from './sidebar/sidebar-filter/sidebar-filter.component';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

import {
  NovoListModule,
  NovoElementsModule,
  NovoHeaderModule,
  NovoModalModule,
  NovoModalService,
  NovoDropdownModule,
  FieldInteractionApi,
  NovoToastService,
} from 'novo-elements';
import { MainPageComponent } from './main-page/main-page.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { ApplyModalComponent } from './apply-modal/apply-modal.component';
import { ClipboardModule } from 'ngx-clipboard';
import { ErrorModalComponent } from './error-modal/error-modal.component';
import { StripHtmlPipe } from './utils/stripHtml.pipe';
import { StructuredSeoComponent } from './structured-seo/structured-seo.component';
import { DatePipe } from '@angular/common';
import { JobResolver } from './job.resolver';
import { ServerResponseService } from './services/server-response/server-response.service';
import { environment } from '../environments/environment';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ApplyFormComponent } from './apply-form/apply-form.component';
import { ApplyFormSalesforceComponent } from './apply-form-salesforce/apply-form-salesforce.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SuccessModal } from './success-modal/success-modal.component';
import { SuccessPageComponent } from './success-page/success-page.component';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { ShareComponent } from './share/share.component';
import { SafeUrlPipe } from './utils/safeUrl.pipe';
import { DeviceDetectorService } from 'ngx-device-detector';

const appRoutes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'jobs/:corpId/:id', component: JobDetailsComponent, resolve: { message: JobResolver } },
  { path: 'jobs/success', component: SuccessPageComponent },
  { path: 'launch', component: MainPageComponent },
  { path: 'corporate', component: MainPageComponent },
  { path: 'senior', component: MainPageComponent },
  { path: 'privacy', component: PrivacyPolicyComponent },
  { path: 'contact-us', component: ContactPageComponent },
];

export function initSettings(settings: SettingsService): any {
  return () => settings.load();
}

@NgModule({
  declarations: [
    AppComponent,
    JobListComponent,
    SidebarComponent,
    MainPageComponent,
    JobDetailsComponent,
    ApplyModalComponent,
    ApplyFormComponent,
    ApplyFormSalesforceComponent,
    SuccessModal,
    ErrorModalComponent,
    StripHtmlPipe,
    SafeUrlPipe,
    SidebarFilterComponent,
    StructuredSeoComponent,
    PrivacyPolicyComponent,
    SuccessPageComponent,
    HeaderComponent,
    FooterComponent,
    ShareComponent,
    ContactPageComponent,
  ],
  entryComponents: [ApplyModalComponent, ErrorModalComponent, SuccessModal],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    NovoElementsModule,
    NovoListModule,
    NoopAnimationsModule,
    NovoHeaderModule,
    BrowserTransferStateModule,
    NovoModalModule,
    ClipboardModule,
    FormsModule,
    ChomskyModule,
    RouterModule.forRoot(appRoutes, { enableTracing: false, useHash: environment.useHash }),
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: initSettings, deps: [SettingsService], multi: true },
    SettingsService,
    SearchService,
    PreviousRoute,
    ShareService,
    FieldInteractionApi,
    NovoModalService,
    NovoToastService,
    NovoDropdownModule,
    ApplyService,
    AnalyticsService,
    DatePipe,
    JobResolver,
    ServerResponseService,
    DeviceDetectorService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
