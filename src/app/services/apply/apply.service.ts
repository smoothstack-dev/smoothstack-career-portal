import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../settings/settings.service';
import { Observable } from 'rxjs';
import { CORPORATION, CORP_TYPE } from '../../../app/typings/corporation';

@Injectable()
export class ApplyService {
  public constructor(private http: HttpClient, public settings: SettingsService) {}
  get baseUrl(): string {
    return 'https://1syp4w9c5h.execute-api.us-east-1.amazonaws.com/prod/careers';
    // return 'http://localhost:3000/local/careers';
  }

  public apply(id: number, params: any, formData: FormData, corpType: CORP_TYPE): Observable<any> {
    let applyParams: any = this.assembleParams(params);
    const corpId = SettingsService.settings[CORPORATION[corpType].serviceName].corpToken;
    return this.http.post(`${this.baseUrl}/${corpId}/${id}?${applyParams}`, formData);
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
