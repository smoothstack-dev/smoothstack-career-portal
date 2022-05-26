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
  public total: number | '...' = '...';
  private start: number = 0;

  constructor(private http: SearchService, private titleService: Title, private meta: Meta, private router: Router) {}

  public ngOnChanges(changes: SimpleChanges): any {
    this.getData();
  }

  public getData(loadMore: boolean = false): void {
    this.start = loadMore ? this.start + 30 : 0;
    this.titleService.setTitle(`${SettingsService.settings.companyName} - Careers`);
    let description: string = TranslateService.translate('PAGE_DESCRIPTION');
    this.meta.updateTag({ name: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'description', content: description });
    const job1 = this.http.getJobs(this.filter, { start: this.start });
    const job2 = this.http.getSAJobs(this.filter, { start: this.start });

    forkJoin([job1, job2]).subscribe(this.onSuccess.bind(this), this.onFailure.bind(this));
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
    let total = 0;
    results.forEach((res, index) => {
      // add service# into data for future process
      let corpType: string;
      if (index === 0) {
        corpType = CORP_TYPE.APPRENTICESHIP;
      } else {
        corpType = CORP_TYPE.STAFF_AUG;
      }
      const jobs = res.data.map((d) => ({ ...d, corpType, corpId: CORPORATION[corpType].corpId }));
      this.jobs = this.jobs.concat(jobs);
      total += res.total;
    });
    this.total = total;
    this.moreAvailable = results[0].count === 30;
    this.loading = false;
  }

  private onFailure(res: any): void {
    this.loading = false;
    this.jobs = [];
    this.total = 0;
    this.moreAvailable = false;
    this.showError.emit(true);
  }
}
