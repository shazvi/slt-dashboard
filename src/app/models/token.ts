export interface Token {
	token_type: string;
	access_token: string;
	metadata: string;
	expires_in: number;
	scope: string;
	refresh_token: string;
	loggedInTime?: number; // Optional
}
