import AsyncStorage from "@react-native-async-storage/async-storage";
import { empty } from "../utils/utils";

export function login(url, password) {
	return new Promise((resolve, reject) => {
		let isFulfilled = false;

		if(empty(url) || empty(password)) {
			isFulfilled = true;
			reject("Both fields must be filled out.");
		} else {
			setTimeout(() => {
				if(!isFulfilled) {
					isFulfilled = true;
					reject("Login failed. Make sure the API URL is valid.");
				}
			}, 5000);

			if(!url.includes("http://") && !url.includes("https://")) {
				url = "http://" + url;
			}

			let lastCharacter = url.substr(url.length - 1);
			if(lastCharacter !== "/") {
				url = url + "/";
			}

			let endpoint = url + "account/login.php?platform=app";

			let body = { password:password };

			fetch(endpoint, {
				body: JSON.stringify(body),
				method: "POST",
				headers: {
					Accept: "application/json", "Content-Type": "application/json"
				}
			})
			.then((json) => {
				return json.json();
			})
			.then(async (response) => {
				if("error" in response) {
					isFulfilled = true;
					reject(response.error);
				} else {
					if(response.valid) {
						isFulfilled = true;
						resolve({ token:response.token, api:url });
					}
				}
			}).catch(error => {
				isFulfilled = true;
				reject("Login failed. Make sure the API URL is valid.");
				console.log(error);
			});
		}
	});
}

export async function verifySession(token) {
	return new Promise(async (resolve, reject) => {
		let isFulfilled = false;

		if(empty(token)) {
			isFulfilled = true;
			reject("Token not found.");
		} else {
			setTimeout(() => {
				if(!isFulfilled) {
					isFulfilled = true;
					reject("Login failed. Make sure the API URL is valid.");
				}
			}, 5000);

			let api = await AsyncStorage.getItem("api");

			let endpoint = api + "account/login.php?platform=app";

			let body = { token:token };

			fetch(endpoint, {
				body: JSON.stringify(body),
				method: "POST",
				headers: {
					Accept: "application/json", "Content-Type": "application/json"
				}
			})
			.then((json) => {
				return json.json();
			})
			.then(async (response) => {
				if("valid" in response && response.valid) {
					isFulfilled = true;
					resolve(response);
				} else {
					await AsyncStorage.removeItem("token");
					isFulfilled = true;
					reject("Invalid token.");
				}
			}).catch(error => {
				isFulfilled = true;
				reject("Login failed. Make sure the API URL is valid.");
				console.log(error);
			});
		}
	});
}