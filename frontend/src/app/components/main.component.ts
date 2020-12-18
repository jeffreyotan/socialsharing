import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CameraService } from '../camera.service';
import { WebService } from '../web.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

	@ViewChild('imageFile') imageFile: ElementRef;

	form: FormGroup;
	isImageLoaded: boolean;

	imagePath = '/assets/cactus.png';

	constructor(private cameraSvc: CameraService, private fb: FormBuilder, private webSvc: WebService, private router: Router) { }

	ngOnInit(): void {
	  if (this.cameraSvc.hasImage()) {
		  const img = this.cameraSvc.getImage();
		  this.imagePath = img.imageAsDataUrl;
	  }

	  this.form = this.fb.group({
		  title: this.fb.control('', [ Validators.required ]),
		  comments: this.fb.control('', [ Validators.required ])
	  });

	  this.isImageLoaded = false;
	}

	clear() {
		this.imagePath = '/assets/cactus.png';
		this.form.reset();
	}

	async onClickShare() {
		const title = this.form.get('title').value;
		const comments = this.form.get('comments').value;
		const activeUser = this.webSvc.getActiveUser();

		const formData = new FormData();
		formData.set('title', title);
		formData.set('comments', comments);
		formData.set('username', activeUser.username);
		formData.set('password', activeUser.password);
		formData.set('image-file', this.cameraSvc.getImage().imageData);

		try {
			const result = await this.webSvc.sendWebShare(formData);

			// if no failure at this point, run clear()
			this.clear();
		} catch (e) {
			console.log("=> Error on sharing:", e);
			this.router.navigate(['/']);
		}
	}
}
