import ServerInfo from "./ServerInfo";
import { User } from "./User";

export async function fetchUser() {
  const response = await fetch(
    `${ServerInfo.SERVER_BASE_URL}/user/me`,
    { credentials: 'include' }
  );
  return response.ok ? (await response.json()) : undefined;
}

export async function signIn(userInfo: User) {
  const response = await fetch(
    `${ServerInfo.SERVER_BASE_URL}/authentication/sign-in`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        username: userInfo.username,
        authenticationHash: userInfo.authenticationHash
      })
    }
  );
  return response.ok;
}

export async function signOut() {
  await fetch(
    `${ServerInfo.SERVER_BASE_URL}/authentication/sign-out`,
    {
      method: 'POST',
      credentials: 'include'
    }
  );
  window.location.reload();
}