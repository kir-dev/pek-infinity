export type CreateGroupDto = {
    /**
     * @type string
    */
    name: string;
    /**
     * @type string
    */
    description: string;
    /**
     * @type string | undefined
    */
    parentId?: string;
    /**
     * @type object
    */
    purpose: object;
    /**
     * @type boolean
    */
    isCommunity: boolean;
    /**
     * @type boolean
    */
    isResort: boolean;
    /**
     * @type boolean
    */
    isTaskForce: boolean;
    /**
     * @type boolean
    */
    hasTransitiveMembership: boolean;
    /**
     * @type boolean
    */
    isArchived: boolean;
};