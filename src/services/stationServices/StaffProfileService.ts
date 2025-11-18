const BASE_API_URL="https://pmis.angstrom-technologies.ug/api/auth/staff-profiles/";

export const StaffProfileService = {
    async fetchStaffProfiles(forceNumber:string) {
        const response = await fetch(`${BASE_API_URL}?force_number=${forceNumber}`);
        return response.json().then(data => data.results ?? data ?? []);
    }
}