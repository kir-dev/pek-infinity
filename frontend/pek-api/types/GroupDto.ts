import type { GroupListItemDto } from "./GroupListItemDto";
import type { MemberListItemDto } from "./MemberListItemDto";

 export const groupDtoPurpose = {
    "UNKNOWN": "UNKNOWN",
    "OLD": "OLD",
    "COMMITTEE": "COMMITTEE",
    "PARTY": "PARTY",
    "CIRCLE": "CIRCLE",
    "D": "D",
    "ELLIPSE": "ELLIPSE",
    "YEAR_CLASS": "YEAR_CLASS",
    "GROUP": "GROUP",
    "CULTURE": "CULTURE",
    "PROJECT": "PROJECT",
    "EVENT": "EVENT",
    "RESORT": "RESORT",
    "SPORT": "SPORT",
    "PROFESSIONAL": "PROFESSIONAL",
    "FLOOR": "FLOOR",
    "SERVICE": "SERVICE"
} as const;
export type GroupDtoPurpose = (typeof groupDtoPurpose)[keyof typeof groupDtoPurpose];
export type GroupDto = {
    /**
     * @description Unique identifier of the group
     * @type string
    */
    id: string;
    /**
     * @description Unique name of the group
     * @type string
    */
    name: string;
    /**
     * @description Description of the group purpose and activities
     * @type string
    */
    description: string;
    /**
     * @description The primary purpose/type of the group
     * @type string
    */
    purpose: GroupDtoPurpose;
    /**
     * @description Whether this group is a community
     * @type boolean
    */
    isCommunity: boolean;
    /**
     * @description Whether this group is a resort
     * @type boolean
    */
    isResort: boolean;
    /**
     * @description Whether this group is a task force
     * @type boolean
    */
    isTaskForce: boolean;
    /**
     * @description Whether this group inherits members from child groups
     * @type boolean
    */
    hasTransitiveMembership: boolean;
    /**
     * @description Children groups of this group
     * @type array
    */
    children: GroupListItemDto[];
    /**
     * @description Parent group of this group
    */
    parent: GroupListItemDto | null;
    /**
     * @description Members of this group
     * @type array
    */
    memberships: MemberListItemDto[];
};