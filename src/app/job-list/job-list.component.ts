import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { SearchService } from '../services/search/search.service';
import { Title, Meta } from '@angular/platform-browser';
import { SettingsService } from '../services/settings/settings.service';
import { Router } from '@angular/router';
import { TranslateService } from 'chomsky';
import { forkJoin } from 'rxjs';
import { CORPORATION, CORP_TYPE } from '../typings/corporation';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss'],
})
export class JobListComponent implements OnChanges {
  @Input() public filter: any;
  @Input() public filterCount: number;
  @Input() public sidebarVisible: boolean = false;
  @Output() public displaySidebar: EventEmitter<any> = new EventEmitter();
  @Output() public showLoading: EventEmitter<boolean> = new EventEmitter();
  @Output() public showError: EventEmitter<boolean> = new EventEmitter();

  public jobs: any[] = [];
  public title: string;
  public _loading: boolean = true;
  public moreAvailable: boolean = true;
  public moreSAAvailable: boolean = true;
  public total: number | '...' = '...';
  private start: number = 0;
  private saStart: number = 0;

  constructor(private http: SearchService, private titleService: Title, private meta: Meta, private router: Router) {}

  public ngOnChanges(changes: SimpleChanges): any {
    this.getData();
  }

  public getData(loadMore: boolean = false): void {
    this.start = loadMore && this.moreAvailable ? this.start + 30 : 0;
    this.saStart = loadMore && this.moreSAAvailable ? this.saStart + 30 : 0;
    this.titleService.setTitle(`${SettingsService.settings.companyName} - Careers`);
    let description: string = TranslateService.translate('PAGE_DESCRIPTION');
    this.meta.updateTag({ name: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'description', content: description });
    const jobCall = this.http.getJobs(this.filter, { start: this.start });
    const saJobCall = this.http.getSAJobs(this.filter, { start: this.saStart });
    forkJoin([jobCall, saJobCall]).subscribe({ next: this.onSuccess.bind(this), error: this.onFailure.bind(this) });
  }

  public loadMore(): void {
    this.getData(true);
  }

  public openSidebar(): void {
    this.displaySidebar.emit(true);
  }

  public loadJob(jobId: number, corpType: CORP_TYPE = CORP_TYPE.APPRENTICESHIP): void {
    const jobUrl = `jobs/${SettingsService.settings[CORPORATION[corpType].serviceName].corpToken}/${jobId}`;
    this.router.navigate([jobUrl]);
    this.loading = true;
  }

  get loading(): boolean {
    return this._loading;
  }

  set loading(value: boolean) {
    this.showLoading.emit(value);
    this._loading = value;
  }

  private onSuccess(results: any[]): void {
    const appRes = results[0].data.map((r) => {
      const corpType = CORP_TYPE.APPRENTICESHIP;
      return {
        ...r,
        corpType,
        corpId: CORPORATION[corpType].corpId,
      };
    });
    const saRes = results[1].data.map((r) => {
      const corpType = CORP_TYPE.STAFF_AUG;
      return {
        ...r,
        corpType,
        corpId: CORPORATION[corpType].corpId,
      };
    });
    this.jobs = [...appRes, ...saRes];
    this.total = this.jobs.length;
    this.moreAvailable = appRes.count === 30;
    this.moreSAAvailable = saRes.count === 30;
    this.loading = false;
  }

  private onFailure(res: any): void {
    this.loading = false;
    this.jobs = [];
    this.total = 0;
    this.moreAvailable = false;
    this.moreSAAvailable = false;
    this.showError.emit(true);
  }
}
