export type UpdateGroupDto = {
    /**
     * @type string | undefined
    */
    name?: string;
    /**
     * @type string | undefined
    */
    description?: string;
    /**
     * @type string | undefined
    */
    parentId?: string;
    /**
     * @type object | undefined
    */
    purpose?: object;
    /**
     * @type boolean | undefined
    */
    isCommunity?: boolean;
    /**
     * @type boolean | undefined
    */
    isResort?: boolean;
    /**
     * @type boolean | undefined
    */
    isTaskForce?: boolean;
    /**
     * @type boolean | undefined
    */
    hasTransitiveMembership?: boolean;
    /**
     * @type boolean | undefined
    */
    isArchived?: boolean;
};