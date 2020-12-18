import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginDetails } from './models';


@Injectable()
export class WebService {

    loginUrl: string = '/login';

    constructor(private http: HttpClient) {}

    async sendAuthentication(data: LoginDetails) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        console.info('-> Obtained data:', data);

        let result = false;
        try {
            await this.http.post(this.loginUrl, data).toPromise();
            // console.info('-> Auth Result: ', result);
            // if we get to this point, we got a 200 status
            result = true;
        } catch (e) {
            // if we are here, we got a 401 status
            console.info('-> Auth failed!', e);
        }
        
        return result;
    }
}