export async function createLinkedInDraftPlaceholder(profileUrl: string, body: string) { return { status: "disabled_in_v1", profileUrl, body, todo: "No LinkedIn sending or automation in V1." }; }
