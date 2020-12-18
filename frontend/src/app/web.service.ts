import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginDetails } from './models';


@Injectable()
export class WebService {

    activeUser: LoginDetails = {
        username: "",
        password: ""
    };

    loginUrl: string = '/login';
    webshareUrl: string = '/share';

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
            this.activeUser = data;
            result = true;
        } catch (e) {
            // if we are here, we got a 401 status
            console.info('-> Auth failed!', e);
        }
        
        return result;
    }

    getActiveUser(): LoginDetails {
        return this.activeUser;
    }

    async sendWebShare(data) {
        return await this.http.post(this.webshareUrl, data).toPromise();
    }
}