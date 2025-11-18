import { Organization } from "../organization";

export interface OrganizationRepository {
    find(): Promise<Organization[] | null>
    findById(id: string): Promise<Organization | null>
    findByName(name: string): Promise<Organization | null>
}
