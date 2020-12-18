import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { WebService } from '../web.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  placeholderUsername: string = "Username";
  placeholderPassword: string = "Password";

	errorMessage = '';

	constructor(private fb: FormBuilder, private webSvc: WebService, private router: Router) { }

	ngOnInit(): void {
    this.form = this.fb.group({
      username: this.fb.control('', [ Validators.required ]),
      password: this.fb.control('', [ Validators.required ])
    });
  }

  async onClickLogin() {
    this.errorMessage = '';

    const username = this.form.get('username').value;
    const password = this.form.get('password').value;

    // console.info(`-> Obtained username=${username}, password=${password}`);

    const result = await this.webSvc.sendAuthentication({ username, password });
    // console.info('-> obtained result: ', result);

    if(result) {
      console.info('-> Auth successfully.');
      this.router.navigate(['/main']);
    } else {
      this.errorMessage = "Login failed! Please try again..";
    }
  }

}
