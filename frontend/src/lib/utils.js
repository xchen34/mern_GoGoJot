export function formatDate(date){
    return date.toLocaleDateString("en-US", {
        month: "short",
        day:"numeric",
        year:"numeric",
    });
}

// Lightweight JWT decoder (Base64URL -> JSON). Returns null on failure.
export function decodeJwt(token) {
    try {
        if (!token) return null;
        const payload = token.split(".")[1];
        if (!payload) return null;
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const json = atob(normalized);
        return JSON.parse(json);
    } catch {
        return null;
    }
}
