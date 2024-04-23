import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../settings/settings.service';
import { Observable } from 'rxjs';
import { CORPORATION, CORP_TYPE } from '../../../app/typings/corporation';

@Injectable()
export class ApplyService {
  public constructor(private http: HttpClient, public settings: SettingsService) {}

  get sfdcBaseUrl(): string {
    return 'https://704k2n7od3.execute-api.us-east-1.amazonaws.com/prod';
    // return 'http://localhost:3000/local';
  }

  public apply(id: number, params: any, formData: FormData, corpType: CORP_TYPE): Observable<any> {
    let applyParams: any = this.assembleParams(params);
    const url =
      corpType === CORP_TYPE.APPRENTICESHIP
        ? `${this.sfdcBaseUrl}/jobs/apply`
        : `${this.sfdcBaseUrl}/staffAug/jobs/apply`;
    return this.http.post(`${url}?${applyParams}`, formData);
  }

  private assembleParams(data: any): string {
    let params: string[] = [];
    for (let key in data) {
      if (!data.hasOwnProperty(key)) {
        continue;
      }
      if (!data[key]) {
        continue;
      }
      let value: any = data[key];
      params.push(`${key}=${value}`);
    }
    return params.join('&');
  }
}
