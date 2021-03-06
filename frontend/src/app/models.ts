export interface CameraImage {
	imageAsDataUrl: string
	imageData: Blob
}

export interface LoginDetails {
	username: string,
	password: string
}

export interface WebShareResult {
	status: string,
	id: string
}
