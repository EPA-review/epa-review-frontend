import ServerInfo from "./ServerInfo";

export async function determineIfSignedIn() {
  const response = await fetch(
    `${ServerInfo.SERVER_BASE_URL}/user/me`,
    { credentials: 'include' }
  );
  return response.ok && (await response.json())._id;
}