/**
 * Layer Management Types for Advanced Tool Organization
 *
 * Defines types for layer-based tool management with support for
 * dependencies, exclusivity policies, and context weight tracking.
 */
/**
 * Layer exclusivity policy
 */
export var LayerExclusivity;
(function (LayerExclusivity) {
    /** Layer can coexist with any other layers */
    LayerExclusivity["NONE"] = "none";
    /** Layer can only coexist with specified layers */
    LayerExclusivity["SELECTIVE"] = "selective";
    /** Layer must be exclusive (unloads all others) */
    LayerExclusivity["EXCLUSIVE"] = "exclusive";
    /** Layer is always active (cannot be deactivated) */
    LayerExclusivity["PERMANENT"] = "permanent";
})(LayerExclusivity || (LayerExclusivity = {}));
/**
 * Layer activation state
 */
export var LayerState;
(function (LayerState) {
    LayerState["INACTIVE"] = "inactive";
    LayerState["ACTIVATING"] = "activating";
    LayerState["ACTIVE"] = "active";
    LayerState["DEACTIVATING"] = "deactivating";
    LayerState["ERROR"] = "error";
})(LayerState || (LayerState = {}));
/**
 * Context pressure level
 */
export var ContextPressure;
(function (ContextPressure) {
    ContextPressure["LOW"] = "low";
    ContextPressure["MEDIUM"] = "medium";
    ContextPressure["HIGH"] = "high";
    ContextPressure["CRITICAL"] = "critical";
})(ContextPressure || (ContextPressure = {}));
//# sourceMappingURL=layer-types.js.map